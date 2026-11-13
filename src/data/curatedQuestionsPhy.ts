import { QuizQuestion } from '../types';

/**
 * Curated Cambridge IGCSE Combined Science (0653) Physics MCQs
 * Grouped strictly by subtopic code (P1.3 - P5.2.3).
 */
export const CURATED_PHY_QUESTIONS: Record<string, QuizQuestion[]> = {
  'P1.3': [
    {
      id: 'cp-p13-1',
      subject: 'physics',
      topicCode: 'P1',
      syllabusRef: 'P1.3',
      question: 'Which statement accurately distinguishes mass from weight?',
      options: [
        'Mass is the measure of the quantity of matter in an object (kg) and stays constant anywhere; weight is the gravitational force on it (N)',
        'Weight is measured in kilograms and remains unchanged on the Moon',
        'Mass decreases on the Moon while weight stays constant',
        'Mass is a downward force while weight is a scalar quantity'
      ],
      correctIndex: 0,
      explanation: 'Mass (kg) is constant everywhere; weight W = mg (N) varies with the local gravitational field strength g.'
    },
    {
      id: 'cp-p13-2',
      subject: 'physics',
      topicCode: 'P1',
      syllabusRef: 'P1.3',
      question: 'An astronaut’s toolbox has a mass of 12 kg on Earth. What are its mass and weight on a moon where gravitational field strength g = 1.6 N/kg?',
      options: ['Mass = 12 kg, Weight = 19.2 N', 'Mass = 1.6 kg, Weight = 19.2 N', 'Mass = 12 kg, Weight = 117.6 N', 'Mass = 7.5 kg, Weight = 12 N'],
      correctIndex: 0,
      explanation: 'Mass does not change (12 kg). Weight W = mg = 12 kg × 1.6 N/kg = 19.2 N.'
    },
    {
      id: 'cp-p13-3',
      subject: 'physics',
      topicCode: 'P1',
      syllabusRef: 'P1.3',
      question: 'Which instrument is used in the laboratory to compare unknown masses directly against standard masses by balancing gravitational moments?',
      options: ['A balance (beam or top-pan balance)', 'A thermometer', 'A measuring cylinder', 'An ammeter'],
      correctIndex: 0,
      explanation: 'A balance compares weights in the same gravitational field to measure mass.'
    }
  ],

  'P1.4': [
    {
      id: 'cp-p14-1',
      subject: 'physics',
      topicCode: 'P1',
      syllabusRef: 'P1.4',
      question: 'Pure liquid water has a density of 1.0 g/cm³. Two solid blocks, A (density 0.85 g/cm³) and B (density 2.7 g/cm³), are placed gently in water. What happens?',
      options: [
        'Block A floats on water while Block B sinks to the bottom',
        'Both Block A and Block B float on the surface',
        'Block B floats while Block A sinks to the bottom',
        'Both blocks remain suspended halfway down the beaker'
      ],
      correctIndex: 0,
      explanation: 'Objects less dense than the surrounding liquid float (0.85 < 1.0); denser objects sink (2.7 > 1.0).'
    },
    {
      id: 'cp-p14-2',
      subject: 'physics',
      topicCode: 'P1',
      syllabusRef: 'P1.4',
      question: 'A student pours 40.0 cm³ of vegetable oil into a dry measuring cylinder of mass 62.0 g. The total mass is now 98.0 g. What is the density of the oil?',
      options: ['0.90 g/cm³', '2.45 g/cm³', '1.11 g/cm³', '1.55 g/cm³'],
      correctIndex: 0,
      explanation: 'Mass of oil = 98.0 − 62.0 = 36.0 g. Density ρ = m / V = 36.0 g / 40.0 cm³ = 0.90 g/cm³.'
    },
    {
      id: 'cp-p14-3',
      subject: 'physics',
      topicCode: 'P1',
      syllabusRef: 'P1.4',
      question: 'When measuring the volume of an irregular stone by displacement in a measuring cylinder, why should your eye be level with the bottom of the meniscus?',
      options: [
        'To avoid parallax error so the true volume reading is recorded accurately',
        'To stop air bubbles expanding the liquid volume',
        'So water surface tension pushes the stone upwards',
        'To lower the density of water during measurement'
      ],
      correctIndex: 0,
      explanation: 'Reading perpendicular/eye-level with the bottom of the meniscus avoids parallax error.'
    }
  ],

  'P1.5.1': [
    {
      id: 'cp-p151-1',
      subject: 'physics',
      topicCode: 'P1',
      syllabusRef: 'P1.5.1',
      question: 'A cyclist rides forward with a driving force of 320 N while air resistance and friction oppose motion with a combined force of 320 N. Describe the cyclist’s motion.',
      options: [
        'The cyclist continues moving forward at a constant speed (zero resultant force)',
        'The cyclist decelerates steadily to a complete stop',
        'The cyclist accelerates forward continuously',
        'The cyclist instantly reverses direction'
      ],
      correctIndex: 0,
      explanation: 'Balanced forces (resultant = 0 N) mean zero acceleration: an already moving object stays at constant velocity.'
    },
    {
      id: 'cp-p151-2',
      subject: 'physics',
      topicCode: 'P1',
      syllabusRef: 'P1.5.1',
      question: 'Two collinear forces act on a crate: 45 N to the right and 18 N to the left. What is the magnitude and direction of the resultant force?',
      options: ['27 N to the right', '63 N to the right', '27 N to the left', '18 N to the right'],
      correctIndex: 0,
      explanation: 'Opposite forces subtract: 45 N − 18 N = 27 N in the direction of the larger force (to the right).'
    }
  ],

  'P1.6.1': [
    {
      id: 'cp-p161-1',
      subject: 'physics',
      topicCode: 'P1',
      syllabusRef: 'P1.6.1',
      question: 'Which energy store decreases and which energy store increases when a stretched rubber catapult fires a pebble vertically upwards?',
      options: [
        'Elastic (strain) energy decreases while kinetic energy (and then gravitational potential energy) increases',
        'Chemical energy increases while gravitational potential energy decreases',
        'Nuclear energy converts directly into elastic energy',
        'Thermal energy converts into electrostatic energy'
      ],
      correctIndex: 0,
      explanation: 'Releasing a stretched band transfers elastic potential energy into kinetic energy and then gravitational potential energy as it rises.'
    },
    {
      id: 'cp-p161-2',
      subject: 'physics',
      topicCode: 'P1',
      syllabusRef: 'P1.6.1',
      question: 'State the Principle of Conservation of Energy.',
      options: [
        'Energy cannot be created or destroyed; it can only be transferred between stores',
        'Useful energy output is always greater than total energy input',
        'Kinetic energy is always destroyed when friction acts',
        'Total energy inside a closed system gradually drops to zero'
      ],
      correctIndex: 0,
      explanation: 'Total energy remains constant in any closed system; it only transfers from one store to another.'
    }
  ],

  'P1.6.2': [
    {
      id: 'cp-p162-1',
      subject: 'physics',
      topicCode: 'P1',
      syllabusRef: 'P1.6.2',
      question: 'A forklift pushes a heavy pallet with a horizontal force of 400 N over a distance of 6.0 m. How much mechanical work is done?',
      options: ['2400 J', '66.7 J', '406 J', '240 J'],
      correctIndex: 0,
      explanation: 'Work done W = F × d = 400 N × 6.0 m = 2400 J.'
    },
    {
      id: 'cp-p162-2',
      subject: 'physics',
      topicCode: 'P1',
      syllabusRef: 'P1.6.2',
      question: 'Why can no real mechanical machine ever have an efficiency exceeding 100%?',
      options: [
        'Some input energy is always wasted/dissipated (usually as thermal energy to the surroundings due to friction) and energy cannot be created',
        'Machines lose gravitational mass when moving fast',
        'Work done equals force divided by distance',
        'Friction creates extra useful kinetic energy'
      ],
      correctIndex: 0,
      explanation: 'Useful energy output is always ≤ total energy input because some energy dissipates to thermal stores.'
    }
  ],

  'P1.6.3': [
    {
      id: 'cp-p163-1',
      subject: 'physics',
      topicCode: 'P1',
      syllabusRef: 'P1.6.3',
      question: 'Which pair of energy resources are BOTH renewable?',
      options: ['Geothermal and hydroelectric power', 'Coal and nuclear fission', 'Natural gas and solar cells', 'Crude oil and wind turbines'],
      correctIndex: 0,
      explanation: 'Renewable resources (solar, wind, hydro, tidal, geothermal, biofuels) replenish naturally; fossil fuels and nuclear fuel are finite.'
    },
    {
      id: 'cp-p163-2',
      subject: 'physics',
      topicCode: 'P1',
      syllabusRef: 'P1.6.3',
      question: 'Which statement correctly evaluates hydroelectric dams as a large-scale electricity source?',
      options: [
        'Low running cost and zero direct greenhouse gas emissions, but building dams floods habitats and displaces communities',
        'They rely completely on burning fossil fuels inside turbines',
        'They cannot respond quickly to peak electricity demand',
        'They produce high-level radioactive waste every day'
      ],
      correctIndex: 0,
      explanation: 'Hydroelectric power is reliable and renewable with quick start-up, though reservoir flooding causes environmental/social impacts.'
    },
    {
      id: 'cp-p163-3',
      subject: 'physics',
      topicCode: 'P1',
      syllabusRef: 'P1.6.3',
      question: 'Apart from geothermal, nuclear, and tidal energy, what is the original ultimate source of almost all Earth’s energy resources (wind, hydro, fossil fuels)?',
      options: ['Radiation from the Sun', 'Earth’s molten iron core', 'Gravitational pull of the Moon', 'Radioactive decay in rocks'],
      correctIndex: 0,
      explanation: 'Solar heating drives winds and the water cycle (hydro), and ancient photosynthesis formed fossil fuels.'
    }
  ],

  'P1.6.4': [
    {
      id: 'cp-p164-1',
      subject: 'physics',
      topicCode: 'P1',
      syllabusRef: 'P1.6.4',
      question: 'What is the definition of power in physics, and what is its standard SI unit?',
      options: [
        'Work done per unit time (or rate of energy transfer), measured in watts (W)',
        'Force multiplied by distance, measured in joules (J)',
        'Mass multiplied by acceleration, measured in newtons (N)',
        'Energy multiplied by time, measured in pascals (Pa)'
      ],
      correctIndex: 0,
      explanation: 'Power P = W / t = ΔE / t, measured in watts (1 W = 1 J/s).'
    },
    {
      id: 'cp-p164-2',
      subject: 'physics',
      topicCode: 'P1',
      syllabusRef: 'P1.6.4',
      question: 'A crane lifts a concrete beam by transferring 18,000 J of useful gravitational potential energy in 12 seconds. What is its useful power output?',
      options: ['1500 W', '216,000 W', '150 W', '3000 W'],
      correctIndex: 0,
      explanation: 'P = ΔE / t = 18,000 J / 12 s = 1500 W.'
    },
    {
      id: 'cp-p164-3',
      subject: 'physics',
      topicCode: 'P1',
      syllabusRef: 'P1.6.4',
      question: 'Student X and Student Y have the same mass and climb the same staircase. Student X reaches the top in half the time taken by Student Y. Compare their work done and power.',
      options: [
        'Both do equal work against gravity, but Student X develops twice the power',
        'Student X does twice the work and develops equal power',
        'Student Y develops twice the power because she takes longer',
        'Both do equal work and develop identical power'
      ],
      correctIndex: 0,
      explanation: 'Work mgh is identical for both; since P = W / t, halving time t doubles power P.'
    }
  ],

  'P1.7': [
    {
      id: 'cp-p17-1',
      subject: 'physics',
      topicCode: 'P1',
      syllabusRef: 'P1.7',
      question: 'Why do snowshoes prevent a hiker from sinking deeply into soft snow?',
      options: [
        'They spread the hiker’s weight over a larger surface area, reducing pressure on the snow',
        'They reduce the hiker’s gravitational mass',
        'They increase the pressure beneath each foot to pack the snow',
        'They create upward magnetic lift against Earth’s field'
      ],
      correctIndex: 0,
      explanation: 'Since p = F / A, increasing contact area A lowers pressure p for the same weight F.'
    },
    {
      id: 'cp-p17-2',
      subject: 'physics',
      topicCode: 'P1',
      syllabusRef: 'P1.7',
      question: 'A rectangular brick weighs 36 N and rests on its smallest face measuring 0.06 m × 0.10 m. What pressure does it exert on the table?',
      options: ['6000 Pa', '600 Pa', '360 Pa', '0.216 Pa'],
      correctIndex: 0,
      explanation: 'Area A = 0.06 × 0.10 = 0.006 m². Pressure p = F / A = 36 / 0.006 = 6000 Pa.'
    }
  ],

  'P2.1.1': [
    {
      id: 'cp-p211-1',
      subject: 'physics',
      topicCode: 'P2',
      syllabusRef: 'P2.1.1',
      question: 'Why are gases easily compressed inside a sealed syringe whereas liquids and solids are virtually incompressible?',
      options: [
        'Gas molecules are far apart with large empty spaces between them, whereas solid and liquid particles are already touching',
        'Gas molecules shrink in atomic diameter when squeezed',
        'Strong repulsive forces pull liquid molecules further apart',
        'Solids lack intermolecular spaces or vibrations'
      ],
      correctIndex: 0,
      explanation: 'Particles in solids and liquids are closely packed with negligible free space between them, unlike gases.'
    },
    {
      id: 'cp-p211-2',
      subject: 'physics',
      topicCode: 'P2',
      syllabusRef: 'P2.1.1',
      question: 'How does the motion of molecules change when a pure liquid cools and freezes into a solid?',
      options: [
        'Molecules lose kinetic energy, stop sliding past one another, and settle into fixed positions where they only vibrate',
        'Molecules move faster and spread randomly to fill the room',
        'Molecules stop moving completely even above absolute zero',
        'Molecules expand to double their original volume'
      ],
      correctIndex: 0,
      explanation: 'Freezing locks particles into regular positions where they vibrate about fixed points.'
    },
    {
      id: 'cp-p211-3',
      subject: 'physics',
      topicCode: 'P2',
      syllabusRef: 'P2.1.1',
      question: 'During melting at 0°C, thermal energy is continuously supplied to ice, yet the thermometer reading remains constant at 0°C until all ice melts. Why?',
      options: [
        'Thermal energy is used to break intermolecular bonds/attractions between water molecules rather than raising average kinetic energy',
        'Water stops absorbing heat at 0°C',
        'All supplied heat escapes instantly as kinetic radiation',
        'The thermometer breaks at freezing point'
      ],
      correctIndex: 0,
      explanation: 'During a change of state, latent heat breaks/overcomes forces between particles without increasing temperature.'
    }
  ],

  'P2.1.2': [
    {
      id: 'cp-p212-1',
      subject: 'physics',
      topicCode: 'P2',
      syllabusRef: 'P2.1.2',
      question: 'In kinetic particle theory, what directly causes the pressure exerted by a gas on the walls of a sealed container?',
      options: [
        'Fast-moving gas particles colliding repeatedly with the container walls and exerting forces',
        'Electrostatic repulsion between stationary gas atoms',
        'The weight of solid molecules settled on the bottom',
        'Thermal radiation bouncing between container lids'
      ],
      correctIndex: 0,
      explanation: 'Each molecular collision with a wall changes momentum and exerts a force; total force per unit area is gas pressure.'
    },
    {
      id: 'cp-p212-2',
      subject: 'physics',
      topicCode: 'P2',
      syllabusRef: 'P2.1.2',
      question: 'A rigid sealed steel cylinder containing gas is heated from 20°C to 80°C. Why does the pressure inside increase?',
      options: [
        'Gas particles move faster, collide more frequently with the walls, and hit the walls harder with greater force',
        'The gas particles double in size and block the nozzle',
        'Extra gas atoms enter through the solid steel walls',
        'Volume expands inside the rigid cylinder'
      ],
      correctIndex: 0,
      explanation: 'Higher temperature → higher average kinetic energy → faster particles → more frequent, harder wall collisions.'
    },
    {
      id: 'cp-p212-3',
      subject: 'physics',
      topicCode: 'P2',
      syllabusRef: 'P2.1.2',
      question: 'What is Brownian motion, as observed when viewing illuminated smoke particles in an air cell under a microscope?',
      options: [
        'Random jerky zig-zag movement of visible smoke specks caused by continuous unequal bombardment by invisible, fast-moving air molecules',
        'Rising convection currents pulling cold air downwards',
        'Smooth circular orbits of dust particles caused by gravity',
        'Chemical combustion of smoke grains in bright microscope light'
      ],
      correctIndex: 0,
      explanation: 'Brownian motion provides direct experimental evidence that invisible fluid molecules are in continuous rapid random motion.'
    }
  ],

  'P2.1.3': [
    {
      id: 'cp-p213-1',
      subject: 'physics',
      topicCode: 'P2',
      syllabusRef: 'P2.1.3',
      question: 'Why does compressing a fixed mass of gas into half its original volume at constant temperature double its pressure?',
      options: [
        'Molecules travel shorter distances between walls and hit the inner surface twice as frequently per second',
        'Compressing a gas doubles the speed of every molecule at constant temperature',
        'Each molecule doubles in mass when compressed',
        'Molecules stick together to reduce container area'
      ],
      correctIndex: 0,
      explanation: 'At constant T, average molecular speed stays constant, but halving volume doubles particle concentration and collision frequency.'
    },
    {
      id: 'cp-p213-2',
      subject: 'physics',
      topicCode: 'P2',
      syllabusRef: 'P2.1.3',
      question: 'A trapped gas sample has volume 60 cm³ at pressure 150 kPa. It expands at constant temperature to 180 cm³. What is its new pressure?',
      options: ['50 kPa', '450 kPa', '100 kPa', '30 kPa'],
      correctIndex: 0,
      explanation: 'Boyle’s law: p₁V₁ = p₂V₂ → p₂ = (150 × 60) / 180 = 50 kPa.'
    }
  ],

  'P2.2.1': [
    {
      id: 'cp-p221-1',
      subject: 'physics',
      topicCode: 'P2',
      syllabusRef: 'P2.2.1',
      question: 'Why are small expansion gaps left between sections of railway tracks and bridges?',
      options: [
        'To allow steel rails to expand safely during hot weather without buckling or warping',
        'To allow rainwater to freeze quickly beneath the track',
        'To reduce friction between train wheels and steel',
        'Because metals contract dramatically when heated'
      ],
      correctIndex: 0,
      explanation: 'Solids expand when heated as atoms vibrate with larger amplitude; expansion gaps prevent buckling.'
    },
    {
      id: 'cp-p221-2',
      subject: 'physics',
      topicCode: 'P2',
      syllabusRef: 'P2.2.1',
      question: 'Why does a bimetallic strip made of brass bonded to invar (iron-nickel) bend into a curve when heated?',
      options: [
        'Brass expands significantly more than invar for the same temperature rise, forcing the strip to curve',
        'Invar melts first and drips off the brass',
        'Thermal energy pushes only one side electrically',
        'Brass contracts while invar expands'
      ],
      correctIndex: 0,
      explanation: 'Different metals expand at different rates when heated, causing a bonded bimetallic strip to bend (used in thermostats).'
    },
    {
      id: 'cp-p221-3',
      subject: 'physics',
      topicCode: 'P2',
      syllabusRef: 'P2.2.1',
      question: 'Which state of matter generally shows the GREATEST thermal expansion for a given temperature increase at constant pressure?',
      options: ['Gases', 'Liquids', 'Solids', 'All three expand identically'],
      correctIndex: 0,
      explanation: 'Intermolecular forces are weakest in gases and strongest in solids, so gases expand most and solids least.'
    }
  ],

  'P2.2.2': [
    {
      id: 'cp-p222-1',
      subject: 'physics',
      topicCode: 'P2',
      syllabusRef: 'P2.2.2',
      question: 'Why does sweat evaporating from a runner’s skin produce a cooling effect?',
      options: [
        'The fastest, highest-energy water molecules escape from the liquid surface, lowering the average kinetic energy (and temperature) of the remaining liquid and skin',
        'Evaporation turns water molecules into ice crystals on the skin',
        'Evaporation increases atmospheric pressure around the body',
        'Slow-moving molecules escape first, leaving high-energy molecules behind'
      ],
      correctIndex: 0,
      explanation: 'Evaporation removes the most energetic molecules, decreasing the average kinetic energy of the remaining liquid (evaporative cooling).'
    },
    {
      id: 'cp-p222-2',
      subject: 'physics',
      topicCode: 'P2',
      syllabusRef: 'P2.2.2',
      question: 'Which three changes ALL increase the rate of evaporation of water from an open tray?',
      options: [
        'Higher temperature, larger exposed surface area, and faster airflow (wind) across the surface',
        'Lower temperature, narrower tray neck, and high humidity',
        'Putting a tight lid on the tray, cooling it, and eliminating draughts',
        'Decreasing surface area and increasing depth of water'
      ],
      correctIndex: 0,
      explanation: 'Higher temperature raises molecular kinetic energy; wider surface area lets more molecules reach the surface; draughts sweep vapour away.'
    },
    {
      id: 'cp-p222-3',
      subject: 'physics',
      topicCode: 'P2',
      syllabusRef: 'P2.2.2',
      question: 'How does evaporation differ from boiling for a pure liquid like water?',
      options: [
        'Evaporation occurs at any temperature below the boiling point and only at the liquid surface; boiling occurs throughout the liquid at a fixed boiling point',
        'Boiling occurs slowly at room temperature only at the surface',
        'Evaporation produces visible bubbles deep inside the liquid',
        'Boiling requires no heat input'
      ],
      correctIndex: 0,
      explanation: 'Boiling occurs at a specific temperature throughout the entire liquid volume, whereas evaporation is a surface phenomenon at any temperature.'
    }
  ],

  'P2.3.1': [
    {
      id: 'cp-p231-1',
      subject: 'physics',
      topicCode: 'P2',
      syllabusRef: 'P2.3.1',
      question: 'Why do metals such as copper conduct thermal energy far more rapidly than non-metals such as wood or plastic?',
      options: [
        'Metals contain mobile delocalised free electrons that rapidly transfer kinetic energy through the lattice alongside atomic vibrations',
        'Metal atoms flow continuously like a liquid convection current',
        'Wood molecules contain zero neutrons to pass on vibrations',
        'Metals absorb heat by turning transparent to radiation'
      ],
      correctIndex: 0,
      explanation: 'Delocalised free electrons move rapidly through metals and collide with distant ions, giving high thermal conductivity.'
    },
    {
      id: 'cp-p231-2',
      subject: 'physics',
      topicCode: 'P2',
      syllabusRef: 'P2.3.1',
      question: 'Why does a metal door handle feel much colder than a wooden door even though both are at the same room temperature?',
      options: [
        'Metal is a better thermal conductor, so it conducts heat away from your warm hand much faster than wood',
        'Metal naturally stays 10°C cooler than room temperature',
        'Wood generates heat internally through respiration',
        'Metal emits cold radiation onto your fingers'
      ],
      correctIndex: 0,
      explanation: 'Both are at room temperature, but copper/steel conducts thermal energy away from skin rapidly, triggering a stronger sensation of cold.'
    },
    {
      id: 'cp-p231-3',
      subject: 'physics',
      topicCode: 'P2',
      syllabusRef: 'P2.3.1',
      question: 'Why are woollen jumpers and loft fibreglass excellent thermal insulators?',
      options: [
        'They trap tiny pockets of air, and air is a poor thermal conductor that cannot circulate by convection when trapped',
        'They convert radiation into stored chemical energy',
        'Wool fibres reflect 100% of infrared radiation',
        'Fibreglass has higher thermal conductivity than aluminium'
      ],
      correctIndex: 0,
      explanation: 'Trapped air pockets stop convection and minimize heat loss by conduction.'
    }
  ],

  'P2.3.2': [
    {
      id: 'cp-p232-1',
      subject: 'physics',
      topicCode: 'P2',
      syllabusRef: 'P2.3.2',
      question: 'Why is the electric heating element placed at the BOTTOM of an electric kettle rather than at the top?',
      options: [
        'Heated water at the bottom expands, becomes less dense, and rises while cooler, denser water sinks to form a convection current',
        'Hot water sinks downwards because it becomes denser when heated',
        'Water conducts heat strongly downwards by delocalised electrons',
        'Steam bubbles are pulled downwards by gravity'
      ],
      correctIndex: 0,
      explanation: 'Convection relies on warm less-dense fluid rising and cool denser fluid sinking to circulate heat throughout the kettle.'
    },
    {
      id: 'cp-p232-2',
      subject: 'physics',
      topicCode: 'P2',
      syllabusRef: 'P2.3.2',
      question: 'Why does convection NOT occur in solid iron or in a vacuum?',
      options: [
        'Convection requires particles in a fluid (liquid or gas) to be free to move in bulk currents',
        'Infrared waves cancel convection currents in solids',
        'Solids have densities too low for gravity to act',
        'Vacuum cools fluids below freezing point instantly'
      ],
      correctIndex: 0,
      explanation: 'Convection is bulk movement of fluid due to density changes; particles in solids are fixed and a vacuum contains no particles.'
    },
    {
      id: 'cp-p232-3',
      subject: 'physics',
      topicCode: 'P2',
      syllabusRef: 'P2.3.2',
      question: 'Why are freezer coils fitted near the TOP of a refrigerator cabinet?',
      options: [
        'Cooled air near the top contracts, becomes denser, and sinks downwards to chill food throughout the fridge',
        'Cold air rises rapidly towards the roof of the fridge',
        'Food radiates more heat downwards than upwards',
        'Conduction only works from top to bottom'
      ],
      correctIndex: 0,
      explanation: 'Cold, denser air sinks while warmer air rises to be cooled, establishing a cooling convection cycle.'
    }
  ],

  'P2.3.3': [
    {
      id: 'cp-p233-1',
      subject: 'physics',
      topicCode: 'P2',
      syllabusRef: 'P2.3.3',
      question: 'How does thermal energy from the Sun travel across 150 million km of empty vacuum to reach Earth?',
      options: [
        'By thermal radiation (infrared and electromagnetic waves), which requires no medium',
        'By convection currents through space gas',
        'By thermal conduction along solar wind dust',
        'By longitudinal sound waves'
      ],
      correctIndex: 0,
      explanation: 'Conduction and convection require a material medium; only electromagnetic thermal radiation can travel through a vacuum.'
    },
    {
      id: 'cp-p233-2',
      subject: 'physics',
      topicCode: 'P2',
      syllabusRef: 'P2.3.3',
      question: 'Two identical cans filled with boiling water are left to cool: Can A is painted matte black; Can B is shiny silver. Which cools faster and why?',
      options: [
        'Can A (matte black) cools faster because dull black surfaces are the best emitters of infrared radiation',
        'Can B (shiny silver) cools faster because silver reflects heat outwards from the water',
        'Both cool at identical speeds because surface colour only affects absorption',
        'Can B cools faster because shiny metal conducts heat more slowly'
      ],
      correctIndex: 0,
      explanation: 'Dull matte black surfaces are both the best absorbers and best emitters of thermal radiation; shiny silver surfaces are poor emitters and good reflectors.'
    },
    {
      id: 'cp-p233-3',
      subject: 'physics',
      topicCode: 'P2',
      syllabusRef: 'P2.3.3',
      question: 'Why are fuel storage tanks and emergency rescue blankets in hot sunny climates often coated shiny silver or white?',
      options: [
        'Shiny light-coloured surfaces are poor absorbers and good reflectors of solar infrared radiation',
        'Silver attracts cold convection currents from high altitudes',
        'White paint accelerates thermal conduction through steel walls',
        'Silver acts as a blackbody emitter at daytime temperatures'
      ],
      correctIndex: 0,
      explanation: 'White/shiny surfaces reflect incoming thermal radiation, minimizing temperature rise.'
    }
  ],

  'P2.3.4': [
    {
      id: 'cp-p234-1',
      subject: 'physics',
      topicCode: 'P2',
      syllabusRef: 'P2.3.4',
      question: 'In a vacuum flask (Thermos), how does the vacuum layer between double glass walls reduce heat transfer?',
      options: [
        'It eliminates both thermal conduction and convection because there are no air particles between the walls',
        'It absorbs all infrared radiation completely',
        'It turns boiling liquids into solids',
        'It reflects sound waves away from the lid'
      ],
      correctIndex: 0,
      explanation: 'A vacuum contains no particles, stopping conduction and convection; silvered glass surfaces minimize radiation loss.'
    },
    {
      id: 'cp-p234-2',
      subject: 'physics',
      topicCode: 'P2',
      syllabusRef: 'P2.3.4',
      question: 'In a vacuum flask, why are the inner glass walls coated with shiny silver?',
      options: [
        'To reduce heat transfer by thermal radiation by reflecting infrared waves back inside',
        'To conduct heat quickly through the glass',
        'To increase convection inside the liquid',
        'To strengthen the plastic cap'
      ],
      correctIndex: 0,
      explanation: 'Silvered surfaces are poor emitters and strong reflectors of infrared radiation.'
    },
    {
      id: 'cp-p234-3',
      subject: 'physics',
      topicCode: 'P2',
      syllabusRef: 'P2.3.4',
      question: 'How does cavity-wall foam insulation reduce winter heat loss from a house?',
      options: [
        'It traps air inside tiny foam bubbles, reducing both convection currents in the cavity and conduction through the walls',
        'It pulls infrared sunlight directly from outside into the living room',
        'It turns brick walls into good thermal conductors',
        'It heats the walls via exothermic reactions'
      ],
      correctIndex: 0,
      explanation: 'Foam blocks convection currents in the air gap and uses trapped gas as a poor conductor.'
    }
  ],

  'P3.1': [
    {
      id: 'cp-p31-1',
      subject: 'physics',
      topicCode: 'P3',
      syllabusRef: 'P3.1',
      question: 'Which statement correctly contrasts transverse waves with longitudinal waves?',
      options: [
        'In transverse waves, vibrations are perpendicular to wave travel (e.g. light, water ripples); in longitudinal waves, vibrations are parallel to wave travel (e.g. sound)',
        'Transverse waves travel only through gases while longitudinal waves travel through vacuums',
        'Sound is a transverse wave with crests and troughs',
        'Longitudinal waves transfer matter permanently from source to detector'
      ],
      correctIndex: 0,
      explanation: 'Transverse oscillations are at 90° to energy transfer direction; longitudinal oscillations are parallel (compressions & rarefactions).'
    },
    {
      id: 'cp-p31-2',
      subject: 'physics',
      topicCode: 'P3',
      syllabusRef: 'P3.1',
      question: 'When water waves travel from deep water into shallower water across a straight boundary at an angle, what happens to their speed, wavelength, and frequency?',
      options: [
        'Speed decreases and wavelength decreases, while frequency stays constant (and waves bend towards the normal)',
        'Speed increases and frequency doubles',
        'Wavelength increases while speed drops to zero',
        'Frequency decreases while wavelength stays constant'
      ],
      correctIndex: 0,
      explanation: 'Frequency is fixed by the wave source. In shallow water, speed drops so λ = v / f decreases, causing refraction towards the normal.'
    }
  ],

  'P3.2.1': [
    {
      id: 'cp-p321-1',
      subject: 'physics',
      topicCode: 'P3',
      syllabusRef: 'P3.2.1',
      question: 'A ray of light strikes a flat plane mirror at an angle of incidence of 38° to the normal. What is the angle between the incident ray and the reflected ray?',
      options: ['76°', '38°', '52°', '104°'],
      correctIndex: 0,
      explanation: 'Law of reflection: angle of reflection r = angle of incidence i = 38°. Total angle between rays = 38° + 38° = 76°.'
    },
    {
      id: 'cp-p321-2',
      subject: 'physics',
      topicCode: 'P3',
      syllabusRef: 'P3.2.1',
      question: 'Which characteristics describe the image formed by a flat plane mirror?',
      options: [
        'Virtual, upright, laterally inverted, same size as the object, and equal distance behind the mirror',
        'Real, inverted, and smaller than the object',
        'Virtual, magnified, and formed on the mirror glass surface',
        'Real, upright, and double the object distance'
      ],
      correctIndex: 0,
      explanation: 'Plane mirrors produce virtual, upright, same-sized, laterally inverted images at equal distance behind the mirror.'
    },
    {
      id: 'cp-p321-3',
      subject: 'physics',
      topicCode: 'P3',
      syllabusRef: 'P3.2.1',
      question: 'A person stands 2.4 m in front of a vertical plane mirror. How far away from the person is their image?',
      options: ['4.8 m', '2.4 m', '1.2 m', '3.6 m'],
      correctIndex: 0,
      explanation: 'The image is 2.4 m behind the mirror, so object-to-image distance is 2.4 + 2.4 = 4.8 m.'
    }
  ],

  'P3.2.2': [
    {
      id: 'cp-p322-1',
      subject: 'physics',
      topicCode: 'P3',
      syllabusRef: 'P3.2.2',
      question: 'A ray of light travels from air into a glass block at an angle of incidence of 45°. Which statement is correct?',
      options: [
        'Light slows down in glass and bends TOWARDS the normal (angle of refraction < 45°)',
        'Light speeds up in glass and bends AWAY from the normal',
        'Light reflects completely at the air-to-glass surface',
        'Light maintains the same speed and continues straight without bending'
      ],
      correctIndex: 0,
      explanation: 'Glass is optically denser than air, so light slows down and refracts towards the normal.'
    },
    {
      id: 'cp-p322-2',
      subject: 'physics',
      topicCode: 'P3',
      syllabusRef: 'P3.2.2',
      question: 'What are the two conditions needed for total internal reflection (TIR) to happen in an optical fibre?',
      options: [
        'Light must be travelling from an optically denser medium (glass) towards a less dense medium (air/cladding) AND the angle of incidence must exceed the critical angle',
        'Light must travel from air into glass at an angle less than the critical angle',
        'The glass core must be coated with matte black paint',
        'Light must hit the boundary along the normal (angle = 0°)'
      ],
      correctIndex: 0,
      explanation: 'TIR requires denser → less dense boundary AND angle of incidence > critical angle (i > c).'
    },
    {
      id: 'cp-p322-3',
      subject: 'physics',
      topicCode: 'P3',
      syllabusRef: 'P3.2.2',
      question: 'A ray of light hits a glass block perpendicular to the surface (along the normal, angle of incidence = 0°). What happens?',
      options: [
        'It slows down upon entering glass but does not change direction',
        'It speeds up and bends by 45°',
        'It undergoes total internal reflection back into air',
        'It splits into a red and violet spectrum immediately'
      ],
      correctIndex: 0,
      explanation: 'Along the normal (i = 0°), wave speed drops but angle of refraction r = 0°, so the ray passes straight through.'
    }
  ],

  'P3.2.3': [
    {
      id: 'cp-p323-1',
      subject: 'physics',
      topicCode: 'P3',
      syllabusRef: 'P3.2.3',
      question: 'What is the "principal focus" (focal point) of a thin converging (convex) lens?',
      options: [
        'The point on the principal axis where parallel rays entering the lens converge to meet after refraction',
        'The exact geometric centre of the glass lens',
        'The edge of the glass where rays diverge outwards',
        'The position where an upright magnified image always forms'
      ],
      correctIndex: 0,
      explanation: 'Parallel rays refracted by a converging lens meet at the principal focus F, one focal length f from the optical centre.'
    },
    {
      id: 'cp-p323-2',
      subject: 'physics',
      topicCode: 'P3',
      syllabusRef: 'P3.2.3',
      question: 'Where must an object be placed so a thin converging lens acts as a magnifying glass forming an upright, enlarged, virtual image?',
      options: [
        'Closer to the lens than one focal length (distance < f)',
        'At exactly twice the focal length (2f)',
        'Beyond twice the focal length (> 2f)',
        'At infinity'
      ],
      correctIndex: 0,
      explanation: 'When object distance u < f, refracted rays diverge; extending them backwards gives a virtual, upright, magnified image.'
    },
    {
      id: 'cp-p323-3',
      subject: 'physics',
      topicCode: 'P3',
      syllabusRef: 'P3.2.3',
      question: 'How does an image formed on a cinema screen by a distant slide in a projector differ from a magnifying glass image?',
      options: [
        'It is a real, inverted image formed by converging light rays actually meeting on the screen',
        'It is a virtual image that cannot be focused onto a screen',
        'It is upright and identical in size to the slide',
        'It is formed by reflection rather than refraction'
      ],
      correctIndex: 0,
      explanation: 'Real images can be projected onto a screen and are inverted; virtual images cannot.'
    }
  ],

  'P3.2.4': [
    {
      id: 'cp-p324-1',
      subject: 'physics',
      topicCode: 'P3',
      syllabusRef: 'P3.2.4',
      question: 'When white light passes through a glass prism, why does violet light refract (bend) MORE than red light?',
      options: [
        'Violet light slows down more than red light in glass, so it changes direction more sharply',
        'Red light has a higher frequency than violet light',
        'Violet light undergoes total internal reflection twice inside the prism',
        'Red light travels faster in vacuum than violet light'
      ],
      correctIndex: 0,
      explanation: 'In glass, different wavelengths travel at slightly different speeds: violet slows most (short λ, highest refraction), red slows least.'
    },
    {
      id: 'cp-p324-2',
      subject: 'physics',
      topicCode: 'P3',
      syllabusRef: 'P3.2.4',
      question: 'List the seven colours of the visible spectrum in order from longest wavelength (least refracted) to shortest wavelength (most refracted).',
      options: [
        'Red, Orange, Yellow, Green, Blue, Indigo, Violet',
        'Violet, Indigo, Blue, Green, Yellow, Orange, Red',
        'Red, Yellow, Green, Orange, Blue, Violet, Indigo',
        'Green, Red, Blue, Yellow, Orange, Indigo, Violet'
      ],
      correctIndex: 0,
      explanation: 'ROYGBIV: Red has the longest wavelength (~700 nm) and refracts least; Violet has the shortest (~400 nm) and refracts most.'
    },
    {
      id: 'cp-p324-3',
      subject: 'physics',
      topicCode: 'P3',
      syllabusRef: 'P3.2.4',
      question: 'What does the term "monochromatic light" mean?',
      options: [
        'Light consisting of a single frequency (single colour/wavelength)',
        'White light split evenly into seven colours',
        'Invisible infrared waves emitted by warm bodies',
        'Light travelling simultaneously in air and water'
      ],
      correctIndex: 0,
      explanation: 'Monochromatic light has a single frequency and therefore cannot be dispersed into a rainbow.'
    }
  ],

  'P3.3': [
    {
      id: 'cp-p33-1',
      subject: 'physics',
      topicCode: 'P3',
      syllabusRef: 'P3.3',
      question: 'At what speed do all electromagnetic waves (radio, visible light, X-rays) travel in a vacuum?',
      options: ['3.0 × 10⁸ m/s', '340 m/s', '3.0 × 10⁵ m/s', '1500 m/s'],
      correctIndex: 0,
      explanation: 'All electromagnetic waves share the same speed in free space/vacuum: c ≈ 3.0 × 10⁸ m/s.'
    },
    {
      id: 'cp-p33-2',
      subject: 'physics',
      topicCode: 'P3',
      syllabusRef: 'P3.3',
      question: 'Which electromagnetic region is used for satellite television communication and mobile phone networks?',
      options: ['Microwaves', 'Gamma rays', 'Infrared rays', 'X-rays'],
      correctIndex: 0,
      explanation: 'Microwaves penetrate Earth’s atmosphere (ionosphere) to communicate reliably with orbiting satellites.'
    }
  ],

  'P3.4': [
    {
      id: 'cp-p34-1',
      subject: 'physics',
      topicCode: 'P3',
      syllabusRef: 'P3.4',
      question: 'What is the approximate audible frequency range for a healthy human ear, and what is ultrasound?',
      options: [
        'Audible range is 20 Hz to 20,000 Hz (20 kHz); ultrasound has frequency greater than 20,000 Hz',
        'Audible range is 1 Hz to 100 Hz; ultrasound is below 20 Hz',
        'Audible range is 300 Hz to 3 × 10⁸ Hz; ultrasound travels faster than light',
        'Audible range is 20 kHz to 200 kHz; ultrasound is transverse'
      ],
      correctIndex: 0,
      explanation: 'Humans normally hear 20 Hz–20 kHz; sound waves above 20 kHz are ultrasound.'
    },
    {
      id: 'cp-p34-2',
      subject: 'physics',
      topicCode: 'P3',
      syllabusRef: 'P3.4',
      question: 'A ship sends an ultrasound pulse vertically down to the seabed and receives the echo 0.80 s later. If sound speed in seawater is 1500 m/s, how deep is the water?',
      options: ['600 m', '1200 m', '1875 m', '300 m'],
      correctIndex: 0,
      explanation: 'Total round-trip distance = 1500 × 0.80 = 1200 m. Water depth = 1200 / 2 = 600 m.'
    }
  ],

  'P4.1.1': [
    {
      id: 'cp-p411-1',
      subject: 'physics',
      topicCode: 'P4',
      syllabusRef: 'P4.1.1',
      question: 'When a polythene rod is rubbed with a woollen cloth, the rod gains electrons and becomes negatively charged. What charge does the cloth acquire?',
      options: [
        'An equal magnitude positive charge, because electrons moved from the cloth onto the rod',
        'A larger negative charge',
        'It remains strictly neutral with no charge',
        'Protons jump from the rod onto the cloth'
      ],
      correctIndex: 0,
      explanation: 'Charging by friction transfers electrons only (never protons). Losing electrons leaves the cloth positively charged.'
    },
    {
      id: 'cp-p411-2',
      subject: 'physics',
      topicCode: 'P4',
      syllabusRef: 'P4.1.1',
      question: 'What happens when a negatively charged acrylic strip is suspended on a thread and brought close to another negatively charged strip?',
      options: [
        'The two strips repel each other because like charges repel',
        'The two strips attract sharply because all charged plastics attract',
        'Nothing happens unless connected by copper wire',
        'Both strips instantly discharge into neutrons'
      ],
      correctIndex: 0,
      explanation: 'Fundamental law of electrostatics: like charges repel, opposite charges attract.'
    },
    {
      id: 'cp-p411-3',
      subject: 'physics',
      topicCode: 'P4',
      syllabusRef: 'P4.1.1',
      question: 'Which statement correctly distinguishes an electrical conductor from an insulator?',
      options: [
        'Conductors (like copper) have free delocalised electrons that flow easily; insulators (like PVC) hold electrons tightly to atoms',
        'Insulators conduct charge only when chilled below 0°C',
        'Conductors have zero resistance at all temperatures while insulators conduct protons',
        'Non-metals are always good electrical conductors'
      ],
      correctIndex: 0,
      explanation: 'Metals conduct via mobile delocalised electrons; plastics/glass/rubber lack mobile charges.'
    }
  ],

  'P4.1.2': [
    {
      id: 'cp-p412-1',
      subject: 'physics',
      topicCode: 'P4',
      syllabusRef: 'P4.1.2',
      question: 'A steady electric current of 2.5 A flows through a lamp for 40 seconds. How much electric charge passes through the lamp?',
      options: ['100 C', '16 C', '0.0625 C', '42.5 C'],
      correctIndex: 0,
      explanation: 'Charge Q = I × t = 2.5 A × 40 s = 100 C (coulombs).'
    },
    {
      id: 'cp-p412-2',
      subject: 'physics',
      topicCode: 'P4',
      syllabusRef: 'P4.1.2',
      question: 'How must an ammeter be connected in a circuit to measure the current passing through a resistor, and how does electron flow compare to conventional current?',
      options: [
        'Connected in series with the resistor; electrons flow from negative to positive while conventional current points from positive to negative',
        'Connected in parallel across the resistor; electrons flow positive to negative',
        'Connected in series; protons carry current from positive to negative',
        'Connected across the battery terminals directly'
      ],
      correctIndex: 0,
      explanation: 'Ammeters always connect in series. Conventional current is + to −, opposite to negatively charged electron drift (− to +).'
    },
    {
      id: 'cp-p412-3',
      subject: 'physics',
      topicCode: 'P4',
      syllabusRef: 'P4.1.2',
      question: 'If 360 C of charge flows past a point in a copper wire in 2.0 minutes, what is the electric current?',
      options: ['3.0 A', '180 A', '720 A', '0.33 A'],
      correctIndex: 0,
      explanation: 'Convert t = 2.0 min = 120 s. Current I = Q / t = 360 C / 120 s = 3.0 A.'
    }
  ],

  'P4.1.3': [
    {
      id: 'cp-p413-1',
      subject: 'physics',
      topicCode: 'P4',
      syllabusRef: 'P4.1.3',
      question: 'How is electromotive force (e.m.f.) or potential difference (p.d.) measured using a voltmeter?',
      options: [
        'In volts (V = J/C), with the voltmeter connected in parallel across the component or cell',
        'In amperes (A), with the voltmeter connected in series inside the loop',
        'In ohms (Ω), using a potentiometer in water',
        'In coulombs (C), connected only to the negative terminal'
      ],
      correctIndex: 0,
      explanation: '1 volt = 1 joule of energy transferred per coulomb of charge (V = W / Q). Voltmeters are always connected in parallel.'
    },
    {
      id: 'cp-p413-2',
      subject: 'physics',
      topicCode: 'P4',
      syllabusRef: 'P4.1.3',
      question: 'A 12 V battery transfers 600 J of electrical energy as charge flows through a heater. How much charge passed through the battery?',
      options: ['50 C', '7200 C', '0.02 C', '120 C'],
      correctIndex: 0,
      explanation: 'W = Q × V → Q = W / V = 600 J / 12 V = 50 C.'
    },
    {
      id: 'cp-p413-3',
      subject: 'physics',
      topicCode: 'P4',
      syllabusRef: 'P4.1.3',
      question: 'What does a potential difference of 9.0 V across an electric lamp mean?',
      options: [
        '9.0 joules of electrical energy are transferred to thermal/light stores for every 1 coulomb of charge passing through the lamp',
        '9.0 coulombs of charge are destroyed inside the lamp each second',
        'A current of 9.0 amperes is forced backwards through the cell',
        'The lamp has a resistance of exactly 9.0 ohms'
      ],
      correctIndex: 0,
      explanation: 'Potential difference is the electrical work done (energy transferred) by a unit charge passing through a component.'
    }
  ],

  'P4.1.4': [
    {
      id: 'cp-p414-1',
      subject: 'physics',
      topicCode: 'P4',
      syllabusRef: 'P4.1.4',
      question: 'A student doubles the length of a uniform nichrome wire while halving its cross-sectional area at constant temperature. How does its electrical resistance R change?',
      options: [
        'Resistance increases by a factor of 4 (4R)',
        'Resistance stays unchanged',
        'Resistance halves (0.5R)',
        'Resistance doubles (2R)'
      ],
      correctIndex: 0,
      explanation: 'R is directly proportional to length L (×2) and inversely proportional to cross-sectional area A (÷0.5 = ×2), so 2 × 2 = 4×.'
    },
    {
      id: 'cp-p414-2',
      subject: 'physics',
      topicCode: 'P4',
      syllabusRef: 'P4.1.4',
      question: 'A potential difference of 12 V is applied across a fixed resistor and a current of 0.40 A is recorded. What is its resistance?',
      options: ['30 Ω', '4.8 Ω', '0.033 Ω', '12.4 Ω'],
      correctIndex: 0,
      explanation: 'R = V / I = 12 V / 0.40 A = 30 Ω.'
    },
    {
      id: 'cp-p414-3',
      subject: 'physics',
      topicCode: 'P4',
      syllabusRef: 'P4.1.4',
      question: 'As current through a filament lamp increases, the filament heats up and its I–V graph curves flatter. Why?',
      options: [
        'Higher filament temperature causes metal ions to vibrate more, obstructing electron flow so resistance increases',
        'Cold metal wires have infinite resistance until they glow',
        'The battery voltage drops to zero',
        'Electrons stop carrying negative charge when hot'
      ],
      correctIndex: 0,
      explanation: 'Filament lamps are non-ohmic conductors: resistance rises significantly with temperature.'
    }
  ],

  'P4.1.5': [
    {
      id: 'cp-p415-1',
      subject: 'physics',
      topicCode: 'P4',
      syllabusRef: 'P4.1.5',
      question: 'An electric kettle connected to a 230 V mains supply draws a current of 10 A. What is its electrical power?',
      options: ['2300 W (2.3 kW)', '23 W', '0.043 W', '240 W'],
      correctIndex: 0,
      explanation: 'Electrical power P = I × V = 10 A × 230 V = 2300 W = 2.3 kW.'
    },
    {
      id: 'cp-p415-2',
      subject: 'physics',
      topicCode: 'P4',
      syllabusRef: 'P4.1.5',
      question: 'A 2.0 kW electric heater runs for 3.0 hours. If electricity costs $0.25 per kWh, what is the cost of running the heater?',
      options: ['$1.50', '$0.75', '$0.50', '$6.00'],
      correctIndex: 0,
      explanation: 'Energy = 2.0 kW × 3.0 h = 6.0 kWh. Cost = 6.0 × $0.25 = $1.50.'
    },
    {
      id: 'cp-p415-3',
      subject: 'physics',
      topicCode: 'P4',
      syllabusRef: 'P4.1.5',
      question: 'How many joules of electrical energy does a 60 W lamp transfer in 5.0 minutes?',
      options: ['18,000 J', '300 J', '12 J', '3000 J'],
      correctIndex: 0,
      explanation: 'Time t = 5 × 60 = 300 s. Energy E = P × t = 60 W × 300 s = 18,000 J.'
    }
  ],

  'P4.2.1': [
    {
      id: 'cp-p421-1',
      subject: 'physics',
      topicCode: 'P4',
      syllabusRef: 'P4.2.1',
      question: 'What happens to the resistance of a light-dependent resistor (LDR) as light intensity shining on it increases?',
      options: [
        'Its resistance decreases sharply, allowing greater current to flow',
        'Its resistance increases to infinity in bright sunlight',
        'It acts as a battery generating high alternating voltage',
        'Its resistance remains strictly constant regardless of brightness'
      ],
      correctIndex: 0,
      explanation: 'In bright light, LDR resistance drops; in darkness, LDR resistance is very high.'
    },
    {
      id: 'cp-p421-2',
      subject: 'physics',
      topicCode: 'P4',
      syllabusRef: 'P4.2.1',
      question: 'What is the main function of a semiconductor diode in an electrical circuit?',
      options: [
        'To allow electric current to flow easily in only one direction (forward bias) while blocking it in reverse',
        'To store chemical energy for backup emergency lighting',
        'To step up alternating mains voltage safely',
        'To vary resistance linearly when turned by hand'
      ],
      correctIndex: 0,
      explanation: 'A diode conducts in one direction only (used for rectification of a.c. to d.c.).'
    },
    {
      id: 'cp-p421-3',
      subject: 'physics',
      topicCode: 'P4',
      syllabusRef: 'P4.2.1',
      question: 'How does the resistance of a negative temperature coefficient (NTC) thermistor change when its temperature rises?',
      options: [
        'Its resistance decreases significantly as temperature increases',
        'Its resistance doubles every 1°C rise',
        'It blows open like a single-use fuse',
        'It reverses battery polarity automatically'
      ],
      correctIndex: 0,
      explanation: 'An NTC thermistor’s resistance drops when warmed, making it ideal for temperature sensors and thermostats.'
    }
  ],

  'P4.2.2': [
    {
      id: 'cp-p422-1',
      subject: 'physics',
      topicCode: 'P4',
      syllabusRef: 'P4.2.2',
      question: 'A 4 Ω resistor and an 8 Ω resistor are connected in SERIES to a 12 V battery. What is the combined resistance and current?',
      options: [
        'Combined resistance = 12 Ω; current = 1.0 A',
        'Combined resistance = 2.67 Ω; current = 4.5 A',
        'Combined resistance = 4 Ω; current = 3.0 A',
        'Combined resistance = 12 Ω; current = 2.0 A'
      ],
      correctIndex: 0,
      explanation: 'In series, R_total = R₁ + R₂ = 4 + 8 = 12 Ω. Current I = V / R_total = 12 / 12 = 1.0 A.'
    },
    {
      id: 'cp-p422-2',
      subject: 'physics',
      topicCode: 'P4',
      syllabusRef: 'P4.2.2',
      question: 'Why are domestic ceiling lights wired in parallel rather than in series?',
      options: [
        'Each lamp receives full mains voltage, can be switched independently, and stays lit if another lamp fails',
        'Parallel wiring increases the total circuit resistance above each individual lamp',
        'Series wiring wastes energy by doubling the current in every branch',
        'Parallel circuits need no return neutral wire'
      ],
      correctIndex: 0,
      explanation: 'In parallel, each branch gets full supply p.d. and operates independently; combined resistance is always less than the smallest branch resistance.'
    }
  ],

  'P4.3': [
    {
      id: 'cp-p43-1',
      subject: 'physics',
      topicCode: 'P4',
      syllabusRef: 'P4.3',
      question: 'Why must a fuse or circuit breaker always be fitted into the LIVE wire of an appliance rather than the neutral wire?',
      options: [
        'So that if a fault blows the fuse, the appliance is completely disconnected from the high-voltage live supply',
        'Because current only flows through the live wire and never enters the neutral wire',
        'To boost the alternating voltage from 230 V to 460 V',
        'Because neutral wires are too thick to hold a fuse'
      ],
      correctIndex: 0,
      explanation: 'Cutting the live wire isolates the appliance from hazardous mains potential; breaking only the neutral leaves internals live.'
    },
    {
      id: 'cp-p43-2',
      subject: 'physics',
      topicCode: 'P4',
      syllabusRef: 'P4.3',
      question: 'An electric iron normally draws a working current of 5.2 A. Which fuse rating (from 3 A, 5 A, 10 A, 13 A) should be fitted in its plug?',
      options: ['10 A', '5 A', '3 A', '13 A is only for low-power lamps'],
      correctIndex: 0,
      explanation: 'Choose the fuse rating just slightly above the normal operating current (5.2 A → 10 A or 13 A; 10 A trips sooner on fault while handling 5.2 A).'
    },
    {
      id: 'cp-p43-3',
      subject: 'physics',
      topicCode: 'P4',
      syllabusRef: 'P4.3',
      question: 'Why do appliances with a plastic outer casing (double insulated) NOT require an earth wire?',
      options: [
        'Plastic is an electrical insulator, so the outer casing cannot become live even if an internal live wire comes loose',
        'Plastic casings absorb dangerous fault currents safely',
        'Double-insulated appliances only run on 1.5 V cells',
        'The neutral wire melts the plastic case safely'
      ],
      correctIndex: 0,
      explanation: 'With no exposed metal casing, users cannot receive a shock from touching the housing.'
    }
  ],

  'P4.4': [
    {
      id: 'cp-p44-1',
      subject: 'physics',
      topicCode: 'P4',
      syllabusRef: 'P4.4',
      question: 'What is the motor effect, and which rule predicts the force direction on a current-carrying wire in a magnetic field?',
      options: [
        'A current-carrying conductor in a magnetic field experiences a force perpendicular to both current and field; predicted by Fleming’s left-hand rule',
        'Static charges attract uncharged plastics; predicted by Boyle’s law',
        'Moving a magnet inside a coil melts the copper; predicted by Snell’s law',
        'Voltage induces resistance along the wire; predicted by Ohm’s law'
      ],
      correctIndex: 0,
      explanation: 'Fleming’s Left-Hand Rule links ThuMb (Motion/Force), First finger (Magnetic Field N→S), and seCond finger (Conventional Current +→−).'
    },
    {
      id: 'cp-p44-2',
      subject: 'physics',
      topicCode: 'P4',
      syllabusRef: 'P4.4',
      question: 'Which three changes increase the strength of the magnetic field inside a solenoid electromagnet?',
      options: [
        'Increasing the current, increasing the number of turns on the coil, and inserting a soft iron core',
        'Using an alternating wooden core and reducing the current',
        'Cooling the iron core in oil and spacing the turns widely apart',
        'Replacing copper wire with plastic tubing'
      ],
      correctIndex: 0,
      explanation: 'More coil turns, larger d.c. current, and a soft iron core maximize magnetic field strength.'
    },
    {
      id: 'cp-p44-3',
      subject: 'physics',
      topicCode: 'P4',
      syllabusRef: 'P4.4',
      question: 'Why is soft iron used for the core of an electromagnet rather than hard steel?',
      options: [
        'Soft iron magnetises strongly when current is switched on and loses its magnetism immediately when switched off',
        'Soft iron stays permanently magnetised forever once switched off',
        'Soft iron melts easily at room temperature',
        'Steel does not conduct electricity inside a transformer'
      ],
      correctIndex: 0,
      explanation: 'Soft iron is a temporary magnetic material ideal for electromagnets and relays that need rapid on/off control.'
    }
  ],

  'P5.1.1': [
    {
      id: 'cp-p511-1',
      subject: 'physics',
      topicCode: 'P5',
      syllabusRef: 'P5.1.1',
      question: 'List the four inner rocky planets of the Solar System in order of increasing distance from the Sun.',
      options: [
        'Mercury, Venus, Earth, Mars',
        'Mars, Earth, Venus, Mercury',
        'Mercury, Earth, Venus, Jupiter',
        'Jupiter, Saturn, Uranus, Neptune'
      ],
      correctIndex: 0,
      explanation: 'The four small rocky inner planets are Mercury, Venus, Earth, and Mars; the four outer gas/ice giants are Jupiter, Saturn, Uranus, Neptune.'
    },
    {
      id: 'cp-p511-2',
      subject: 'physics',
      topicCode: 'P5',
      syllabusRef: 'P5.1.1',
      question: 'Why does Neptune take much longer to complete one orbit around the Sun than Earth?',
      options: [
        'Neptune has a much larger orbital path circumference AND moves slower because the Sun’s gravitational pull is weaker at greater distance',
        'Neptune moves faster than Mercury around the Sun',
        'Neptune has a smaller mass than Earth',
        'Neptune orbits Earth before orbiting the Sun'
      ],
      correctIndex: 0,
      explanation: 'Greater orbital radius increases total orbit length and reduces gravitational field strength, lowering orbital speed.'
    },
    {
      id: 'cp-p511-3',
      subject: 'physics',
      topicCode: 'P5',
      syllabusRef: 'P5.1.1',
      question: 'How does the orbit of a typical comet around the Sun differ from Earth’s orbit?',
      options: [
        'A comet follows a highly elliptical (elongated) orbit, travelling much faster when close to the Sun and slower when far away',
        'A comet moves in a perfect circle at constant speed',
        'A comet stays stationary outside the Solar System',
        'A comet orbits slower when nearest to the Sun'
      ],
      correctIndex: 0,
      explanation: 'Comets have highly elliptical orbits; gravitational potential energy converts into kinetic energy as they swing rapidly near the Sun.'
    }
  ],

  'P5.2.1': [
    {
      id: 'cp-p521-1',
      subject: 'physics',
      topicCode: 'P5',
      syllabusRef: 'P5.2.1',
      question: 'Which nuclear process inside the Sun’s core releases vast amounts of energy during its stable main-sequence phase?',
      options: [
        'Nuclear fusion of hydrogen nuclei into helium nuclei',
        'Nuclear fission of uranium atoms into lead',
        'Combustion of hydrogen gas with atmospheric oxygen',
        'Chemical electrolysis of liquid helium'
      ],
      correctIndex: 0,
      explanation: 'Stars are powered by nuclear fusion: light hydrogen nuclei fuse under extreme temperature and pressure into helium, releasing energy.'
    },
    {
      id: 'cp-p521-2',
      subject: 'physics',
      topicCode: 'P5',
      syllabusRef: 'P5.2.1',
      question: 'What is one "light-year" in astrophysics?',
      options: [
        'The distance travelled by light in a vacuum during one Earth year (≈ 9.5 × 10¹⁵ m)',
        'The time required for Earth to orbit the Sun once',
        'The brightness of the Sun measured from Mars',
        'The average age of a main-sequence star'
      ],
      correctIndex: 0,
      explanation: 'A light-year is a unit of astronomical distance, NOT time: distance = speed of light × seconds in 1 year.'
    }
  ],

  'P5.2.2': [
    {
      id: 'cp-p522-1',
      subject: 'physics',
      topicCode: 'P5',
      syllabusRef: 'P5.2.2',
      question: 'Which sequence correctly describes the future life cycle of a low-mass star like our Sun after its current stable phase?',
      options: [
        'Red giant → planetary nebula + white dwarf → black dwarf',
        'Red supergiant → supernova explosion → black hole',
        'Protostar → blue giant → neutron star directly',
        'Nebula → asteroid belt → comet'
      ],
      correctIndex: 0,
      explanation: 'Sun-sized stars swell into a red giant, shed outer layers as a planetary nebula, leaving a dense cooling white dwarf.'
    },
    {
      id: 'cp-p522-2',
      subject: 'physics',
      topicCode: 'P5',
      syllabusRef: 'P5.2.2',
      question: 'During a star’s long stable main-sequence lifetime, which two forces or pressures remain balanced?',
      options: [
        'Inward gravitational pull balances outward thermal/radiation pressure from core nuclear fusion',
        'Magnetism from planets balances solar wind friction',
        'Centrifugal force balances nuclear fission decay',
        'Dark energy pushes hydrogen atoms into helium'
      ],
      correctIndex: 0,
      explanation: 'Hydrostatic equilibrium: inward gravity = outward radiation/gas pressure generated by fusion.'
    },
    {
      id: 'cp-p522-3',
      subject: 'physics',
      topicCode: 'P5',
      syllabusRef: 'P5.2.2',
      question: 'What happens at the end of the life cycle of a massive star (much more massive than the Sun)?',
      options: [
        'After becoming a red supergiant, it explodes in a supernova leaving a neutron star or black hole',
        'It shrinks quietly into a stable planet like Jupiter',
        'It reverses nuclear fusion back into hydrogen gas clouds without exploding',
        'It becomes a cold moon orbiting a white dwarf'
      ],
      correctIndex: 0,
      explanation: 'Massive stars form red supergiants, then detonate in a supernova (forging heavy elements) leaving a neutron star or black hole.'
    }
  ],

  'P5.2.3': [
    {
      id: 'cp-p523-1',
      subject: 'physics',
      topicCode: 'P5',
      syllabusRef: 'P5.2.3',
      question: 'What is "redshift" observed in the light coming from distant galaxies, and what does it provide evidence for?',
      options: [
        'Observed wavelengths of light are stretched towards the red end of the spectrum because distant galaxies are receding from us in an expanding Universe',
        'Distant stars glow red only because they are covered in red iron dust',
        'Light speeds up beyond 3.0 × 10⁸ m/s as it leaves galaxies',
        'Galaxies are all collapsing inward towards Earth'
      ],
      correctIndex: 0,
      explanation: 'Cosmological redshift shows galaxies are moving away; the further the galaxy, the faster it recedes (Big Bang expansion).'
    },
    {
      id: 'cp-p523-2',
      subject: 'physics',
      topicCode: 'P5',
      syllabusRef: 'P5.2.3',
      question: 'What is Cosmic Microwave Background Radiation (CMBR) and why is it key evidence for the Big Bang theory?',
      options: [
        'Uniform microwave radiation arriving from all directions in space — stretched remnant thermal radiation from the hot early Universe',
        'Radio broadcasts reflected off Jupiter’s magnetic rings',
        'Heat generated exclusively by the Sun’s surface sunspots',
        'High-energy X-rays emitted inside Earth’s core'
      ],
      correctIndex: 0,
      explanation: 'CMBR is the cooled, redshifted afterglow from the hot early Universe, matching Big Bang predictions.'
    },
    {
      id: 'cp-p523-3',
      subject: 'physics',
      topicCode: 'P5',
      syllabusRef: 'P5.2.3',
      question: 'In cosmic hierarchy from smallest to largest, what is the correct ordering?',
      options: [
        'Earth → Solar System → Milky Way galaxy → Universe',
        'Solar System → Earth → Universe → Milky Way galaxy',
        'Milky Way galaxy → Solar System → Earth → Universe',
        'Universe → Milky Way galaxy → Solar System → Earth'
      ],
      correctIndex: 0,
      explanation: 'Earth orbits the Sun in the Solar System, which sits inside the Milky Way galaxy, one of billions of galaxies in the Universe.'
    }
  ]
};
