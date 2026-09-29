import { SubtopicTopicGroup } from './subtopicSlidesData';

export const physicsSubtopicsData: SubtopicTopicGroup[] = [
  {
    subtopicCode: 'P1.1',
    topicCode: 'P1',
    topicName: 'Motion, forces and energy',
    title: 'Physical Quantities & Measuring Techniques',
    subject: 'physics',
    tier: 'Core',
    syllabusSummary: [
      'Describe the use of rulers and measuring cylinders to determine length and volume.',
      'Use clocks and stopwatches to measure intervals of time; find average values for multiple periods (e.g. pendulum).'
    ],
    decks: [
      {
        id: 'deck-p1-1',
        subtopicCode: 'P1.1',
        topicCode: 'P1',
        title: 'Measuring Instruments & Period of Pendulum',
        subtopicHeader: '[P1.1] Physical Quantities and Measuring Techniques',
        classworkDate: '14/07/2025',
        objectives: [
          'Measure length, volume, and time using standard instruments.',
          'Calculate period of a pendulum by timing 20 oscillations and dividing by 20 to minimize reaction time error.'
        ],
        keywords: ['length', 'volume', 'time', 'meniscus', 'period', 'oscillation', 'reaction time error'],
        slides: [
          {
            id: 'p1-1-s1',
            slideNumber: 1,
            subtopicHeader: '[P1.1] Measurement Techniques',
            title: 'Precision in Length, Volume and Time',
            slideType: 'theory',
            content: [
              '• Measuring Length: Use a ruler; avoid parallax error by reading at eye level perpendicular to the scale.',
              '• Measuring Volume: Measuring cylinder; place on flat surface and read the bottom of the curved meniscus at eye level.',
              '• Time & Pendulum Oscillations: Reaction time uncertainty (~0.2 s) is significant for one swing. To obtain an accurate period (T): Time 20 complete oscillations with a stopwatch, then divide total time by 20: T = total time ÷ 20.'
            ]
          }
        ]
      }
    ]
  },

  {
    subtopicCode: 'P1.2',
    topicCode: 'P1',
    topicName: 'Motion, forces and energy',
    title: 'Motion, Speed & Graphs',
    subject: 'physics',
    tier: 'Core & Supplement',
    syllabusSummary: [
      'Define speed as distance / time and average speed.',
      'Distance-time graphs (gradient = speed; horizontal = stationary).',
      'Velocity and acceleration a = (v - u) / t.',
      'Velocity-time graphs: gradient = acceleration; area under graph = distance travelled.'
    ],
    decks: [
      {
        id: 'deck-p1-2-speed',
        subtopicCode: 'P1.2',
        topicCode: 'P1',
        title: 'Speed, Velocity & Acceleration',
        subtopicHeader: '[P1.2] Speed and Acceleration',
        classworkDate: '15/07/2025 - 21/07/2025',
        objectives: [
          'Calculate speed = distance / time.',
          'Define acceleration as change in velocity per unit time: a = (v - u) / t.'
        ],
        keywords: ['speed', 'velocity', 'acceleration', 'deceleration', 'scalar', 'vector'],
        slides: [
          {
            id: 'p1-2-s1',
            slideNumber: 1,
            subtopicHeader: '[P1.2] Motion Formulas',
            title: 'Kinematic Formulas and Units',
            slideType: 'math',
            content: [
              '• Speed (v): Distance moved per unit time -> v = d / t (metres per second, m/s).',
              '• Average Speed: Total distance ÷ Total time.',
              '• Velocity: Speed in a given specified direction (vector quantity).',
              '• Acceleration (a): Rate of change of velocity -> a = (v - u) / t (m/s²), where v = final velocity, u = initial velocity, and t = time taken.'
            ]
          }
        ]
      },
      {
        id: 'deck-p1-2-graphs',
        subtopicCode: 'P1.2',
        topicCode: 'P1',
        title: 'Distance-Time & Velocity-Time Graphs',
        subtopicHeader: '[P1.2] Distance-Time and Velocity-Time Graphs',
        classworkDate: '18/07/2025 - 22/07/2025',
        objectives: [
          'Interpret distance-time graphs (gradient = speed).',
          'Interpret velocity-time graphs: gradient = acceleration; area under line = distance.'
        ],
        keywords: ['distance-time graph', 'velocity-time graph', 'gradient', 'area under graph'],
        slides: [
          {
            id: 'p1-2-g1',
            slideNumber: 1,
            subtopicHeader: '[P1.2] Graph Interpretation',
            title: 'Interpreting Motion Graphs',
            slideType: 'theory',
            content: [
              '• Distance-Time Graph:',
              '  - Horizontal flat line: Stationary (at rest).',
              '  - Straight diagonal line: Constant steady speed.',
              '  - Gradient (rise / run) = Speed.',
              '  - Curving upwards: Accelerating.',
              '• Velocity-Time Graph:',
              '  - Horizontal flat line: Constant velocity (zero acceleration).',
              '  - Upward sloping straight line: Constant uniform acceleration.',
              '  - Gradient = Acceleration = (v - u) / t.',
              '  - Area Under the Graph: Total Distance Travelled (calculate using areas of rectangles and triangles: 1/2 × base × height).'
            ]
          }
        ]
      }
    ]
  },

  {
    subtopicCode: 'P1.3',
    topicCode: 'P1',
    topicName: 'Motion, forces and energy',
    title: 'Mass, Weight & Gravity',
    subject: 'physics',
    tier: 'Core & Supplement',
    syllabusSummary: [
      'Mass as amount of matter; weight as gravitational force on an object.',
      'Equation: W = m × g (where g = 9.8 N/kg or 10 N/kg on Earth).',
      'Gravitational field strength as force per unit mass.'
    ],
    decks: [
      {
        id: 'deck-p1-3',
        subtopicCode: 'P1.3',
        topicCode: 'P1',
        title: 'Mass, Weight & Gravitational Field Strength',
        subtopicHeader: '[P1.3] Weight, Mass & Gravity',
        classworkDate: '23/07/2025',
        objectives: [
          'Distinguish between mass and weight.',
          'Calculate weight using W = m × g.'
        ],
        keywords: ['mass', 'weight', 'gravity', 'gravitational field strength', 'newtons', 'kilograms'],
        slides: [
          {
            id: 'p1-3-s1',
            slideNumber: 1,
            subtopicHeader: '[P1.3] Mass vs Weight',
            title: 'Mass vs Weight Comparison',
            slideType: 'theory',
            content: [
              '• Mass (m): The amount of matter in an object; measured in kilograms (kg); stays CONSTANT everywhere in the universe.',
              '• Weight (W): The gravitational force acting on an object with mass; measured in Newtons (N); changes if gravitational field strength changes.',
              '• Formula: Weight (N) = mass (kg) × gravitational field strength g (N/kg) -> W = m × g.',
              '• On Earth, g ≈ 9.8 N/kg (often rounded to 10 N/kg). An astronaut with mass 70 kg weighs 70 × 9.8 = 686 N on Earth, but only 70 × 1.6 = 112 N on the Moon.'
            ]
          }
        ]
      }
    ]
  },

  {
    subtopicCode: 'P1.4',
    topicCode: 'P1',
    topicName: 'Motion, forces and energy',
    title: 'Density & Practical Techniques',
    subject: 'physics',
    tier: 'Core & Supplement',
    syllabusSummary: [
      'Define density as mass / volume (ρ = m / V).',
      'Determine density of regular solids (ruler calculation), irregular solids (displacement can / Eureka can), and liquids.'
    ],
    decks: [
      {
        id: 'deck-p1-4',
        subtopicCode: 'P1.4',
        topicCode: 'P1',
        title: 'Density Equation & Eureka Can Displacement Practical',
        subtopicHeader: '[P1.4] Density practical',
        classworkDate: '24/07/2025 - 28/07/2025',
        objectives: [
          'Calculate density using ρ = m / V.',
          'Measure volume of irregular solids using displacement of water.'
        ],
        keywords: ['density', 'mass', 'volume', 'displacement can', 'eureka can', 'meniscus'],
        slides: [
          {
            id: 'p1-4-s1',
            slideNumber: 1,
            subtopicHeader: '[P1.4] Density Formula',
            title: 'Density Calculations & Units',
            slideType: 'math',
            content: [
              '• Density (ρ) = Mass (m) ÷ Volume (V) -> ρ = m / V.',
              '• Units: kg/m³ or g/cm³ (1 g/cm³ = 1000 kg/m³).',
              '• Regular Solid: Measure length, width, height with ruler to find Volume = l × w × h. Measure mass on electronic balance. Divide m / V.',
              '• Irregular Solid: 1) Measure mass on balance; 2) Fill Eureka can to spout; 3) Gently submerge irregular solid; 4) Collect displaced water in measuring cylinder: Displaced volume = Object volume.'
            ]
          }
        ]
      }
    ]
  },

  {
    subtopicCode: 'P1.5.1',
    topicCode: 'P1',
    topicName: 'Motion, forces and energy',
    title: 'Effects of Forces, Friction & Drag',
    subject: 'physics',
    tier: 'Core & Supplement',
    syllabusSummary: [
      'Forces produce changes in size, shape, and motion.',
      'Resultant force; Newton\'s second law F = m × a.',
      'Friction as force between two surfaces opposing motion; air resistance / drag and terminal velocity.'
    ],
    decks: [
      {
        id: 'deck-p1-5-1',
        subtopicCode: 'P1.5.1',
        topicCode: 'P1',
        title: 'Forces, Newton\'s 2nd Law & Friction',
        subtopicHeader: '[P1.5.1] Forces',
        classworkDate: '29/07/2025',
        objectives: [
          'Determine resultant force along a straight line.',
          'State and use F = m × a.',
          'Explain friction and drag forces.'
        ],
        keywords: ['resultant force', 'newtons', 'friction', 'air resistance', 'drag', 'terminal velocity'],
        slides: [
          {
            id: 'p1-5-1-s1',
            slideNumber: 1,
            subtopicHeader: '[P1.5.1] Newton\'s Second Law',
            title: 'Resultant Force & Acceleration (F = ma)',
            slideType: 'theory',
            content: [
              '• Resultant Force: The single overall force that has the same effect as all the individual forces acting on the body combined.',
              '• If Resultant Force = 0 N: Object remains at rest OR continues moving at constant speed in a straight line (Newton\'s 1st Law).',
              '• If Resultant Force ≠ 0 N: Object accelerates in direction of resultant force (Newton\'s 2nd Law): F = m × a (Force in N, mass in kg, acceleration in m/s²).',
              '• Friction & Drag: Oppose motion of surfaces or fluids; convert kinetic energy into thermal energy.'
            ]
          }
        ]
      }
    ]
  },

  {
    subtopicCode: 'P1.6.1',
    topicCode: 'P1',
    topicName: 'Motion, forces and energy',
    title: 'Energy Stores & Transfers',
    subject: 'physics',
    tier: 'Core & Supplement',
    syllabusSummary: [
      'Energy stores: kinetic, gravitational potential, chemical, elastic, nuclear, thermal.',
      'Transfers: mechanical, electrical, heating, radiation (light and sound).',
      'Law of conservation of energy; formulas: Ek = 1/2mv² and ΔEp = mgh.'
    ],
    decks: [
      {
        id: 'deck-p1-6-1',
        subtopicCode: 'P1.6.1',
        topicCode: 'P1',
        title: 'Energy Stores, Transfers & Calculations (Ek and Ep)',
        subtopicHeader: '[P1.6.1] Energy Stores and Energy Transfers',
        classworkDate: '30/07/2025 - 31/07/2025',
        objectives: [
          'Identify the 6 energy stores and 4 transfer pathways.',
          'Calculate kinetic energy Ek = 1/2mv² and gravitational potential energy ΔEp = mgh.'
        ],
        keywords: ['kinetic energy', 'gravitational potential energy', 'conservation of energy', 'joules'],
        slides: [
          {
            id: 'p1-6-1-s1',
            slideNumber: 1,
            subtopicHeader: '[P1.6.1] Energy Formulas',
            title: 'Energy Conservation & Equations',
            slideType: 'math',
            content: [
              '• Principle of Conservation of Energy: Energy cannot be created or destroyed, only transferred from one store to another.',
              '• Kinetic Energy: Ek = 1/2 × m × v² (mass in kg, velocity in m/s, Ek in Joules, J).',
              '• Gravitational Potential Energy: ΔEp = m × g × Δh (mass in kg, g = 9.8 N/kg, height in metres, ΔEp in J).',
              '• Falling Object: In absence of air resistance, Loss of Ep = Gain of Ek -> mgh = 1/2mv².'
            ]
          }
        ]
      }
    ]
  },

  {
    subtopicCode: 'P1.6.2',
    topicCode: 'P1',
    topicName: 'Motion, forces and energy',
    title: 'Work & Efficiency',
    subject: 'physics',
    tier: 'Core & Supplement',
    syllabusSummary: [
      'Work done as energy transferred: W = F × d.',
      'Efficiency = (useful energy output / total energy input) × 100%.'
    ],
    decks: [
      {
        id: 'deck-p1-6-2',
        subtopicCode: 'P1.6.2',
        topicCode: 'P1',
        title: 'Work Done & Efficiency Calculations',
        subtopicHeader: '[P1.6.2] Work',
        classworkDate: '01/08/2025',
        objectives: [
          'Calculate work done W = F × d.',
          'Calculate percentage efficiency of machines and devices.'
        ],
        keywords: ['work done', 'joules', 'force', 'distance', 'efficiency', 'wasted energy'],
        slides: [
          {
            id: 'p1-6-2-s1',
            slideNumber: 1,
            subtopicHeader: '[P1.6.2] Work & Efficiency Formulas',
            title: 'Mechanical Work & Percentage Efficiency',
            slideType: 'math',
            content: [
              '• Work Done (W): Mechanical energy transferred when a force moves an object through a distance in the direction of the force -> W = F × d (1 Joule = 1 Newton metre).',
              '• Efficiency: Fraction of input energy converted into useful output form:',
              '  - Efficiency = (Useful energy output ÷ Total energy input) × 100%',
              '  - Efficiency = (Useful power output ÷ Total power input) × 100%',
              '• No real machine is 100% efficient because energy is always wasted as heat and sound dissipated to surroundings due to friction.'
            ]
          }
        ]
      }
    ]
  },

  {
    subtopicCode: 'P1.6.3',
    topicCode: 'P1',
    topicName: 'Motion, forces and energy',
    title: 'Energy Resources',
    subject: 'physics',
    tier: 'Core & Supplement',
    syllabusSummary: [
      'Renewable vs non-renewable resources.',
      'Fossil fuels, nuclear, biofuels, wind, hydroelectric, tidal, solar cells, geothermal.',
      'Sun as primary source for all except geothermal, nuclear, and tidal.'
    ],
    decks: [
      {
        id: 'deck-p1-6-3',
        subtopicCode: 'P1.6.3',
        topicCode: 'P1',
        title: 'Renewable & Non-Renewable Energy Resources',
        subtopicHeader: '[P1.6.3] Energy Resources',
        classworkDate: '04/08/2025 - 05/08/2025',
        objectives: [
          'Compare renewable and non-renewable energy resources.',
          'State which resources originate from the Sun (fossil fuels, wind, solar, wave, biomass).'
        ],
        keywords: ['renewable', 'non-renewable', 'fossil fuels', 'nuclear', 'solar', 'wind', 'hydroelectric', 'geothermal'],
        slides: [
          {
            id: 'p1-6-3-s1',
            slideNumber: 1,
            subtopicHeader: '[P1.6.3] Resource Comparison',
            title: 'Types of Energy Resources',
            slideType: 'theory',
            content: [
              '• Non-Renewable: Used faster than naturally replenished; finite reserves (Coal, Crude Oil, Natural Gas, Uranium nuclear fuel). Reliable base-load power, but release greenhouse gases (fossil fuels) or radioactive waste (nuclear).',
              '• Renewable: Replenished naturally and will not run out (Solar, Wind, Hydroelectric, Tidal, Geothermal, Wave, Biomass). Clean and low carbon emissions, but some are weather-dependent (unreliable).',
              '• Origin: The Sun drives solar, wind, wave, hydroelectric, biomass, and fossil fuels. ONLY Geothermal (Earth heat), Nuclear (uranium), and Tidal (Moon gravity) do NOT originate from the Sun.'
            ]
          }
        ]
      }
    ]
  },

  {
    subtopicCode: 'P1.6.4',
    topicCode: 'P1',
    topicName: 'Motion, forces and energy',
    title: 'Power',
    subject: 'physics',
    tier: 'Core',
    syllabusSummary: [
      'Define power as work done per unit time or energy transferred per unit time.',
      'Equation: P = ΔW / Δt or P = ΔE / Δt (Watts, where 1 W = 1 J/s).'
    ],
    decks: [
      {
        id: 'deck-p1-6-4',
        subtopicCode: 'P1.6.4',
        topicCode: 'P1',
        title: 'Power: Rate of Energy Transfer',
        subtopicHeader: '[P1.6.4] Power',
        classworkDate: '06/08/2025',
        objectives: [
          'Define power as rate of doing work or transferring energy.',
          'Calculate power using P = ΔE / t.'
        ],
        keywords: ['power', 'watts', 'joules per second', 'rate of work'],
        slides: [
          {
            id: 'p1-6-4-s1',
            slideNumber: 1,
            subtopicHeader: '[P1.6.4] Power Equation',
            title: 'Calculating Power (P = E / t)',
            slideType: 'math',
            content: [
              '• Power (P): The rate at which work is done or energy is transferred -> Power = Energy ÷ Time -> P = ΔE / t.',
              '• Units: Watts (W), where 1 Watt = 1 Joule per second (1 J/s). Kilowatt (kW) = 1000 W.',
              '• Example: A crane lifts a 500 kg crate through 10 m in 5 s.',
              '  - Work done = F × d = (500 × 9.8) × 10 = 49,000 J.',
              '  - Power = W ÷ t = 49,000 ÷ 5 = 9,800 W (9.8 kW).'
            ]
          }
        ]
      }
    ]
  },

  {
    subtopicCode: 'P1.7',
    topicCode: 'P1',
    topicName: 'Motion, forces and energy',
    title: 'Pressure',
    subject: 'physics',
    tier: 'Core & Supplement',
    syllabusSummary: [
      'Define pressure as force per unit area: p = F / A (Pascals, Pa or N/m²).',
      'Explain practical consequences: snowshoes/caterpillar tracks reduce pressure; sharp knife/nail increases pressure.'
    ],
    decks: [
      {
        id: 'deck-p1-7',
        subtopicCode: 'P1.7',
        topicCode: 'P1',
        title: 'Pressure Formula & Real-Life Applications',
        subtopicHeader: '[P1.7] Pressure',
        classworkDate: '07/08/2025',
        objectives: [
          'Calculate pressure using p = F / A.',
          'Explain why large surface area lowers pressure and small surface area increases pressure.'
        ],
        keywords: ['pressure', 'pascals', 'force', 'area', 'surface area'],
        slides: [
          {
            id: 'p1-7-s1',
            slideNumber: 1,
            subtopicHeader: '[P1.7] Pressure Formula & Examples',
            title: 'Pressure Equation (p = F / A)',
            slideType: 'math',
            content: [
              '• Pressure (p) = Force (F) ÷ Area (A) -> p = F / A.',
              '• Units: Pascals (Pa), where 1 Pa = 1 N/m²; or N/cm².',
              '• High Pressure Applications (Small Area): Sharp knife edge concentrates cutting force into tiny area -> extremely high pressure cuts easily; drawing pin pointed tip penetrates wood effortlessly.',
              '• Low Pressure Applications (Large Area): Snowshoes spread body weight over huge surface area -> low pressure prevents sinking into snow; wide tractor/tank tracks traverse soft mud.'
            ]
          }
        ]
      }
    ]
  },

  {
    subtopicCode: 'P2.1.1',
    topicCode: 'P2',
    topicName: 'Thermal physics',
    title: 'States of Matter & Particle Arrangement',
    subject: 'physics',
    tier: 'Core',
    syllabusSummary: [
      'Describe properties and particle models of solids, liquids, and gases.'
    ],
    decks: [
      {
        id: 'deck-p2-1-1',
        subtopicCode: 'P2.1.1',
        topicCode: 'P2',
        title: 'Thermal Particle Model of States of Matter',
        subtopicHeader: '[P2.1.1] States of Matter Recap',
        classworkDate: '11/08/2025',
        objectives: [
          'Relate molecular forces and kinetic energy to solid, liquid, gas behavior.'
        ],
        keywords: ['thermal physics', 'kinetic energy', 'vibrations', 'intermolecular forces'],
        slides: [
          {
            id: 'p2-1-1-s1',
            slideNumber: 1,
            subtopicHeader: '[P2.1.1] Particle Models',
            title: 'Kinetic Model of Matter',
            slideType: 'theory',
            content: [
              '• Solid: Strong forces; regular lattice; vibrate around fixed positions.',
              '• Liquid: Medium forces; touch but can slide over one another.',
              '• Gas: Very weak forces; move rapidly and randomly in all directions.'
            ]
          }
        ]
      }
    ]
  },

  {
    subtopicCode: 'P2.1.2',
    topicCode: 'P2',
    topicName: 'Thermal physics',
    title: 'Particle Model & Gas Pressure',
    subject: 'physics',
    tier: 'Core',
    syllabusSummary: [
      'Describe gas pressure in terms of molecular collisions with the container walls.'
    ],
    decks: [
      {
        id: 'deck-p2-1-2',
        subtopicCode: 'P2.1.2',
        topicCode: 'P2',
        title: 'Gas Pressure & Molecular Collisions',
        subtopicHeader: '[P2.1.2] Particle motion in gases',
        classworkDate: '11/08/2025',
        objectives: [
          'Explain gas pressure as force exerted per unit area by colliding gas molecules.'
        ],
        keywords: ['gas pressure', 'collisions', 'momentum change', 'force per unit area'],
        slides: [
          {
            id: 'p2-1-2-s1',
            slideNumber: 1,
            subtopicHeader: '[P2.1.2] Pressure Origin',
            title: 'How Gas Molecules Exert Pressure',
            slideType: 'theory',
            content: [
              '• Gas particles are in continuous, rapid, random motion.',
              '• When gas molecules collide with the interior walls of their container, they rebound, undergoing a change in momentum.',
              '• According to Newton\'s 2nd Law, this change in momentum exerts a force on the wall.',
              '• Millions of collisions occurring every second over the wall surface create a continuous outward force per unit area: Pressure = Force / Area.'
            ]
          }
        ]
      }
    ]
  },

  {
    subtopicCode: 'P2.1.3',
    topicCode: 'P2',
    topicName: 'Thermal physics',
    title: 'Pressure & Volume Changes (Boyle\'s Law)',
    subject: 'physics',
    tier: 'Core & Supplement',
    syllabusSummary: [
      'Describe qualitative relationship between pressure, volume, and temperature of a gas.',
      'Explain using particle model: heating increases pressure at constant volume; Boyle\'s law p1V1 = p2V2 at constant temp.'
    ],
    decks: [
      {
        id: 'deck-p2-1-3',
        subtopicCode: 'P2.1.3',
        topicCode: 'P2',
        title: 'Boyle\'s Law & Temperature Effects on Gases',
        subtopicHeader: '[P2.1.3] Gas Pressure & Boyle\'s Law',
        classworkDate: '12/08/2025',
        objectives: [
          'Explain effect of temperature on gas pressure at constant volume.',
          'Explain Boyle\'s Law (p1V1 = p2V2) at constant temperature.'
        ],
        keywords: ['Boyle\'s law', 'inversely proportional', 'gas volume', 'collision frequency'],
        slides: [
          {
            id: 'p2-1-3-s1',
            slideNumber: 1,
            subtopicHeader: '[P2.1.3] Boyle\'s Law',
            title: 'Pressure-Volume-Temperature Relationships',
            slideType: 'theory',
            content: [
              '• Increasing Temperature (Constant Volume): Molecules gain kinetic energy and move faster -> collide more frequently and with greater force -> pressure increases.',
              '• Decreasing Volume (Constant Temperature): Particles are confined to a smaller space -> hit walls more frequently -> pressure increases.',
              '• Boyle\'s Law: For a fixed mass of gas at constant temperature, pressure is inversely proportional to volume: p1 × V1 = p2 × V2.'
            ]
          }
        ]
      }
    ]
  },

  {
    subtopicCode: 'P2.2.1',
    topicCode: 'P2',
    topicName: 'Thermal physics',
    title: 'Thermal Expansion',
    subject: 'physics',
    tier: 'Core & Supplement',
    syllabusSummary: [
      'Describe thermal expansion of solids, liquids, and gases at constant pressure.',
      'Explain relative order of expansion: gases > liquids > solids; applications (bimetallic strips, expansion joints) and consequences.'
    ],
    decks: [
      {
        id: 'deck-p2-2-1',
        subtopicCode: 'P2.2.1',
        topicCode: 'P2',
        title: 'Thermal Expansion of Solids, Liquids & Gases',
        subtopicHeader: '[P2.2.1] Evaporation and Expansion',
        classworkDate: '13/08/2025',
        objectives: [
          'Compare thermal expansion in solids, liquids, and gases.',
          'Explain why gases expand the most and describe bimetallic strip applications.'
        ],
        keywords: ['thermal expansion', 'bimetallic strip', 'expansion joints', 'molecular separation'],
        slides: [
          {
            id: 'p2-2-1-s1',
            slideNumber: 1,
            subtopicHeader: '[P2.2.1] Expansion Order',
            title: 'Expansion in Solids vs Liquids vs Gases',
            slideType: 'theory',
            content: [
              '• When substances are heated, particles gain kinetic energy and vibrate/move faster, pushing each other further apart -> volume expands.',
              '• Relative Order: Gases expand MUCH MORE than liquids, which expand more than solids (Gases > Liquids > Solids) because intermolecular forces in gases are negligible.',
              '• Applications: Bimetallic strip in thermostats (brass expands faster than iron, bending strip to break circuit); gaps left in railway tracks to prevent buckling in hot summers.'
            ]
          }
        ]
      }
    ]
  },

  {
    subtopicCode: 'P2.2.2',
    topicCode: 'P2',
    topicName: 'Thermal physics',
    title: 'Evaporation',
    subject: 'physics',
    tier: 'Core & Supplement',
    syllabusSummary: [
      'Describe evaporation as escape of most energetic molecules from surface of a liquid; causes cooling of remaining liquid.',
      'Factors affecting evaporation: surface area, temperature, draught/wind.'
    ],
    decks: [
      {
        id: 'deck-p2-2-2',
        subtopicCode: 'P2.2.2',
        topicCode: 'P2',
        title: 'Evaporative Cooling Mechanism & Rate Factors',
        subtopicHeader: '[P2.2.2] Evaporation and Cooling',
        classworkDate: '13/08/2025',
        objectives: [
          'Explain why evaporation causes cooling in terms of energy of escaping particles.',
          'Identify factors that increase rate of evaporation.'
        ],
        keywords: ['evaporation', 'cooling effect', 'kinetic energy', 'draught', 'sweating'],
        slides: [
          {
            id: 'p2-2-2-s1',
            slideNumber: 1,
            subtopicHeader: '[P2.2.2] Evaporative Cooling',
            title: 'Mechanism of Evaporative Cooling',
            slideType: 'theory',
            content: [
              '• In any liquid, particles have a range of kinetic energies.',
              '• Only the most energetic particles at the surface have enough energy to overcome attractive intermolecular forces and escape into the gas phase.',
              '• Since the fastest particles escape, the AVERAGE kinetic energy of the remaining liquid particles DECREASES.',
              '• Since temperature is directly proportional to average kinetic energy, the temperature of the remaining liquid falls (Cooling Effect). E.g. sweating cools human skin.',
              '• Factors increasing rate: Higher temperature, larger surface area, wind/airflow.'
            ]
          }
        ]
      }
    ]
  },

  {
    subtopicCode: 'P2.3.1',
    topicCode: 'P2',
    topicName: 'Thermal physics',
    title: 'Thermal Conduction',
    subject: 'physics',
    tier: 'Core & Supplement',
    syllabusSummary: [
      'Describe thermal conduction in solids.',
      'Distinguish good thermal conductors (metals) from poor conductors / insulators (wood, plastic, air); explain free electron diffusion in metals.'
    ],
    decks: [
      {
        id: 'deck-p2-3-1',
        subtopicCode: 'P2.3.1',
        topicCode: 'P2',
        title: 'Conduction & Delocalised Electrons in Metals',
        subtopicHeader: '[P2.3.1] Conduction and Convection',
        classworkDate: '14/08/2025',
        objectives: [
          'Describe conduction via lattice vibrations.',
          'Explain why metals are superior conductors due to free electron diffusion.'
        ],
        keywords: ['conduction', 'free electrons', 'delocalised', 'lattice vibrations', 'thermal insulator'],
        slides: [
          {
            id: 'p2-3-1-s1',
            slideNumber: 1,
            subtopicHeader: '[P2.3.1] Conduction Mechanism',
            title: 'How Thermal Conduction Occurs',
            slideType: 'theory',
            content: [
              '• Non-Metals: Atoms near heat source vibrate more vigorously and collide with neighbouring atoms, transferring kinetic energy slowly down the lattice.',
              '• Metals (Super-Conductors): Contain a sea of free DELOCALISED ELECTRONS. When heated, free electrons gain kinetic energy and move rapidly through the structure, colliding directly with distant metal ions to transfer thermal energy very rapidly.',
              '• Thermal Insulators: Trapped air, fiberglass, wood, Styrofoam (air has widely spaced molecules, making conduction negligible).'
            ]
          }
        ]
      }
    ]
  },

  {
    subtopicCode: 'P2.3.2',
    topicCode: 'P2',
    topicName: 'Thermal physics',
    title: 'Thermal Convection',
    subject: 'physics',
    tier: 'Core & Supplement',
    syllabusSummary: [
      'Describe convection in fluids (liquids and gases) in terms of density changes; convection currents.'
    ],
    decks: [
      {
        id: 'deck-p2-3-2',
        subtopicCode: 'P2.3.2',
        topicCode: 'P2',
        title: 'Convection Currents in Liquids & Gases',
        subtopicHeader: '[P2.3.2] Convection Currents',
        classworkDate: '15/08/2025',
        objectives: [
          'Explain convection currents using density changes upon heating.',
          'Describe sea breezes and domestic radiators.'
        ],
        keywords: ['convection', 'density', 'fluids', 'convection current', 'sea breeze'],
        slides: [
          {
            id: 'p2-3-2-s1',
            slideNumber: 1,
            subtopicHeader: '[P2.3.2] Convection Cycle',
            title: 'Mechanism of Convection in Fluids',
            slideType: 'theory',
            content: [
              '• Step 1: Fluid near the heat source is warmed -> particles gain kinetic energy and move faster and further apart.',
              '• Step 2: The warm fluid expands and becomes LESS DENSE than surrounding cooler fluid.',
              '• Step 3: The less dense warm fluid RISES.',
              '• Step 4: Denser, cooler fluid sinks to take its place, gets heated in turn, setting up a continuous CONVECTION CURRENT.',
              '• Convection CANNOT occur in solids because particles cannot flow.'
            ]
          }
        ]
      }
    ]
  },

  {
    subtopicCode: 'P2.3.3',
    topicCode: 'P2',
    topicName: 'Thermal physics',
    title: 'Thermal Radiation & Leslie Cube',
    subject: 'physics',
    tier: 'Core & Supplement',
    syllabusSummary: [
      'Thermal radiation is infrared electromagnetic radiation; requires no medium (travels through vacuum of space).',
      'Emitter and absorber properties: matt black (best emitter/absorber), shiny white/silver (worst emitter/absorber, best reflector).'
    ],
    decks: [
      {
        id: 'deck-p2-3-3',
        subtopicCode: 'P2.3.3',
        topicCode: 'P2',
        title: 'Infrared Radiation & Leslie Cube Experiment',
        subtopicHeader: '[P2.3.3] Thermal Radiation',
        classworkDate: '18/08/2025',
        objectives: [
          'Describe infrared radiation as an electromagnetic wave traveling through a vacuum.',
          'Compare emission and absorption of matt black vs shiny silver surfaces using a Leslie cube.'
        ],
        keywords: ['infrared', 'radiation', 'vacuum', 'matt black', 'shiny silver', 'Leslie cube', 'emitter', 'absorber'],
        slides: [
          {
            id: 'p2-3-3-s1',
            slideNumber: 1,
            subtopicHeader: '[P2.3.3] Radiation Properties',
            title: 'Matt Black vs Shiny Silver Surfaces',
            slideType: 'theory',
            content: [
              '• Thermal Radiation is INFRARED radiation (part of the electromagnetic spectrum). Unlike conduction and convection, it does NOT require particles and travels through a vacuum at the speed of light.',
              '• Surface Characteristics:',
              '  - Matt Black: BEST emitter of thermal radiation, BEST absorber of radiation, poorest reflector.',
              '  - Shiny Silver / White: POOREST emitter, POOREST absorber, BEST reflector of radiation.',
              '• Leslie Cube Experiment: Metal cube filled with boiling water with 4 vertical faces (matt black, shiny silver, matt white, shiny black). Infrared detector placed equal distance from each face detects highest radiation emission from the MATT BLACK face.'
            ]
          }
        ]
      }
    ]
  },

  {
    subtopicCode: 'P2.3.4',
    topicCode: 'P2',
    topicName: 'Thermal physics',
    title: 'Thermal Insulation & Real-Life Transfer',
    subject: 'physics',
    tier: 'Core',
    syllabusSummary: [
      'Consequences of thermal energy transfer: greenhouse effect, building insulation, vacuum flasks.'
    ],
    decks: [
      {
        id: 'deck-p2-3-4',
        subtopicCode: 'P2.3.4',
        topicCode: 'P2',
        title: 'Vacuum Flasks & Domestic Loft Insulation',
        subtopicHeader: '[P2.3.4] Thermal transfer in real life',
        classworkDate: '19/08/2025',
        objectives: [
          'Explain how a vacuum flask prevents conduction, convection, and radiation.',
          'Describe loft insulation, cavity wall foam, and double glazing.'
        ],
        keywords: ['vacuum flask', 'double glazing', 'cavity wall', 'insulation', 'trapped air'],
        slides: [
          {
            id: 'p2-3-4-s1',
            slideNumber: 1,
            subtopicHeader: '[P2.3.4] Flask & Home Insulation',
            title: 'Minimizing Heat Loss: Vacuum Flask Design',
            slideType: 'theory',
            content: [
              '• Vacuum Flask Features:',
              '  - Vacuum between double glass walls: Stops CONDUCTION and CONVECTION (no particles).',
              '  - Silvered inner surfaces: Reflect infrared radiation back into liquid, stopping RADIATION loss.',
              '  - Plastic stopper: Poor conductor, prevents evaporation and convection currents from opening.',
              '• Home Insulation:',
              '  - Double Glazing: Narrow air gap between panes stops conduction; gap too narrow for convection currents.',
              '  - Loft Insulation & Cavity Wall Foam: Fibreglass traps pockets of motionless air, preventing conduction and convection.'
            ]
          }
        ]
      }
    ]
  },

  {
    subtopicCode: 'P3.1',
    topicCode: 'P3',
    topicName: 'Waves',
    title: 'Wave Properties & Calculations',
    subject: 'physics',
    tier: 'Core & Supplement',
    syllabusSummary: [
      'Waves transfer energy without transferring matter.',
      'Transverse (vibrations perpendicular to propagation) vs longitudinal (parallel, compressions/rarefactions).',
      'Wave terms: amplitude, wavelength (λ), frequency (f), wave speed (v).',
      'Equation: v = f × λ.'
    ],
    decks: [
      {
        id: 'deck-p3-1',
        subtopicCode: 'P3.1',
        topicCode: 'P3',
        title: 'Transverse, Longitudinal Waves & v = f × λ',
        subtopicHeader: '[P3.1] Wave Calculations',
        classworkDate: '20/08/2025 - 21/08/2025',
        objectives: [
          'Compare transverse and longitudinal waves.',
          'Calculate wave speed using v = f × λ.'
        ],
        keywords: ['transverse', 'longitudinal', 'amplitude', 'wavelength', 'frequency', 'wave speed', 'hertz'],
        slides: [
          {
            id: 'p3-1-s1',
            slideNumber: 1,
            subtopicHeader: '[P3.1] Wave Definitions & Equation',
            title: 'Transverse vs Longitudinal & v = fλ',
            slideType: 'theory',
            content: [
              '• Transverse Waves: Oscillations are PERPENDICULAR (at 90°) to direction of energy transfer (e.g. EM waves, light, water ripples, seismic S-waves). Features crests and troughs.',
              '• Longitudinal Waves: Oscillations are PARALLEL to direction of energy transfer (e.g. sound waves, ultrasound, seismic P-waves). Features COMPRESSIONS (high pressure) and RAREFACTIONS (low pressure).',
              '• The Wave Equation: Wave speed (v, m/s) = frequency (f, Hz) × wavelength (λ, m) -> v = f × λ.'
            ]
          }
        ]
      }
    ]
  },

  {
    subtopicCode: 'P3.2.1',
    topicCode: 'P3',
    topicName: 'Waves',
    title: 'Reflection of Light',
    subject: 'physics',
    tier: 'Core',
    syllabusSummary: [
      'Law of reflection: angle of incidence (i) = angle of reflection (r).',
      'Normal line at 90°; plane mirror ray tracing; virtual, upright, laterally inverted image.'
    ],
    decks: [
      {
        id: 'deck-p3-2-1',
        subtopicCode: 'P3.2.1',
        topicCode: 'P3',
        title: 'Reflection of Light & Ray Box Practical',
        subtopicHeader: '[P3.2.1] Reflection of Light',
        classworkDate: '25/08/2025',
        objectives: [
          'State that angle of incidence = angle of reflection (i = r).',
          'Describe plane mirror ray tracing and characteristics of virtual image.'
        ],
        keywords: ['reflection', 'normal', 'angle of incidence', 'angle of reflection', 'virtual image', 'ray box'],
        slides: [
          {
            id: 'p3-2-1-s1',
            slideNumber: 1,
            subtopicHeader: '[P3.2.1] Law of Reflection',
            title: 'Law of Reflection & Ray Tracing',
            slideType: 'theory',
            content: [
              '• Normal: Imaginary reference line drawn at exactly 90° (perpendicular) to reflecting surface.',
              '• Angle of Incidence (i): Angle between incident ray and normal.',
              '• Angle of Reflection (r): Angle between reflected ray and normal.',
              '• Law of Reflection: Angle of incidence = Angle of reflection (i = r).',
              '• Plane Mirror Image: 1) Same size as object; 2) Same distance behind mirror as object is in front; 3) Upright; 4) Laterally inverted (left-right flipped); 5) VIRTUAL (cannot be projected onto a screen).'
            ]
          }
        ]
      }
    ]
  },

  {
    subtopicCode: 'P3.2.2',
    topicCode: 'P3',
    topicName: 'Waves',
    title: 'Refraction of Light',
    subject: 'physics',
    tier: 'Core & Supplement',
    syllabusSummary: [
      'Describe refraction at glass/perspex/water boundaries; rays bend towards normal when entering denser medium (slows down), and away from normal when exiting (speeds up).'
    ],
    decks: [
      {
        id: 'deck-p3-2-2',
        subtopicCode: 'P3.2.2',
        topicCode: 'P3',
        title: 'Refraction of Light Through Glass Block Practical',
        subtopicHeader: '[P3.2.2] Investigating Refraction',
        classworkDate: '26/08/2025',
        objectives: [
          'Describe refraction due to speed change in optical media.',
          'Draw ray paths through rectangular glass block.'
        ],
        keywords: ['refraction', 'optical density', 'normal', 'speed of light', 'glass block'],
        slides: [
          {
            id: 'p3-2-2-s1',
            slideNumber: 1,
            subtopicHeader: '[P3.2.2] Refraction Rules',
            title: 'Why Light Refracts at Boundaries',
            slideType: 'theory',
            content: [
              '• Refraction is the change in direction of a wave when it crosses a boundary between different optical densities due to a change in wave speed.',
              '• Air to Glass (Denser): Light slows down -> bends TOWARDS the normal (angle of refraction r < angle of incidence i).',
              '• Glass to Air (Less dense): Light speeds up -> bends AWAY from the normal (r > i).',
              '• Ray along normal (at 90° to boundary): Slows down but DOES NOT change direction.'
            ]
          }
        ]
      }
    ]
  },

  {
    subtopicCode: 'P3.2.3',
    topicCode: 'P3',
    topicName: 'Waves',
    title: 'Thin Converging Lens',
    subject: 'physics',
    tier: 'Core',
    syllabusSummary: [
      'Describe action of thin converging lens on a parallel beam of light.',
      'Principal focus (focal point F) and focal length f.'
    ],
    decks: [
      {
        id: 'deck-p3-2-3',
        subtopicCode: 'P3.2.3',
        topicCode: 'P3',
        title: 'Thin Converging (Convex) Lens Ray Optics',
        subtopicHeader: '[P3.2.3] Thin Converging Lens',
        classworkDate: '27/08/2025',
        objectives: [
          'Describe focal point and focal length of convex lens.',
          'Draw ray diagrams showing real and virtual images.'
        ],
        keywords: ['converging lens', 'convex', 'principal focus', 'focal length', 'real image', 'magnifying glass'],
        slides: [
          {
            id: 'p3-2-3-s1',
            slideNumber: 1,
            subtopicHeader: '[P3.2.3] Converging Lens Optics',
            title: 'Focal Point and Lens Ray Tracing',
            slideType: 'theory',
            content: [
              '• Converging (Convex) Lens: Thicker in middle than at edges.',
              '• Principal Axis: Horizontal line passing through optical centre of lens.',
              '• Principal Focus (F): Point on principal axis where incident rays parallel to the axis converge after refraction through lens.',
              '• Focal Length (f): Distance from optical centre of lens to principal focus.',
              '• Real Image: Light rays actually converge and pass through image point; can be focused on a screen (e.g. camera, projector).',
              '• Magnifying Glass: When object is placed within focal length (distance < f), lens produces an enlarged, upright, VIRTUAL image.'
            ]
          }
        ]
      }
    ]
  },

  {
    subtopicCode: 'P3.2.4',
    topicCode: 'P3',
    topicName: 'Waves',
    title: 'Dispersion of Light',
    subject: 'physics',
    tier: 'Core',
    syllabusSummary: [
      'Describe dispersion of white light into a spectrum by a glass prism (ROYGBIV); red light refracts least, violet light refracts most.'
    ],
    decks: [
      {
        id: 'deck-p3-2-4',
        subtopicCode: 'P3.2.4',
        topicCode: 'P3',
        title: 'Dispersion of White Light by a Triangular Prism',
        subtopicHeader: '[P3.2.4] Dispersion of light',
        classworkDate: '28/08/2025',
        objectives: [
          'Describe dispersion of white light into seven spectrum colours.',
          'Explain why violet refracts most and red refracts least.'
        ],
        keywords: ['dispersion', 'prism', 'spectrum', 'ROYGBIV', 'refraction'],
        slides: [
          {
            id: 'p3-2-4-s1',
            slideNumber: 1,
            subtopicHeader: '[P3.2.4] Prism Dispersion',
            title: 'Separating White Light into the Spectrum',
            slideType: 'theory',
            content: [
              '• White light is a mixture of all the colours of the visible spectrum: Red, Orange, Yellow, Green, Blue, Indigo, Violet (ROYGBIV).',
              '• Dispersion: Splitting of white light into its component wavelengths by a triangular glass prism.',
              '• Why Dispersion Occurs: In glass, different wavelengths travel at different speeds. Red light has longest wavelength and slows down least -> refracts the LEAST. Violet light has shortest wavelength and slows down most -> refracts the MOST.'
            ]
          }
        ]
      }
    ]
  },

  {
    subtopicCode: 'P3.3',
    topicCode: 'P3',
    topicName: 'Waves',
    title: 'The Electromagnetic Spectrum',
    subject: 'physics',
    tier: 'Core & Supplement',
    syllabusSummary: [
      'Features of EM waves: travel through vacuum at 3.0 × 10⁸ m/s, transverse waves.',
      'Order of spectrum: Radio, Microwave, Infrared, Visible, Ultraviolet, X-rays, Gamma rays.',
      'Uses and hazards of each region (e.g. UV skin damage, X-ray mutations).'
    ],
    decks: [
      {
        id: 'deck-p3-3',
        subtopicCode: 'P3.3',
        topicCode: 'P3',
        title: 'The Electromagnetic (EM) Spectrum & Applications',
        subtopicHeader: '[P3.3] The Electromagnetic Spectrum',
        classworkDate: '01/09/2025',
        objectives: [
          'Recall order of EM spectrum by wavelength and frequency.',
          'Describe uses and dangers of radio, microwave, IR, visible, UV, X-ray, and gamma.'
        ],
        keywords: ['electromagnetic spectrum', 'radio waves', 'microwaves', 'infrared', 'ultraviolet', 'x-rays', 'gamma rays', 'ionising'],
        slides: [
          {
            id: 'p3-3-s1',
            slideNumber: 1,
            subtopicHeader: '[P3.3] EM Waves Overview',
            title: 'Order, Speed & Properties of EM Spectrum',
            slideType: 'theory',
            content: [
              '• Common Properties: All are transverse waves; all travel through a vacuum at the speed of light c = 3.0 × 10⁸ m/s; transfer energy.',
              '• Order (Decreasing Wavelength / Increasing Frequency & Energy):',
              '  1. Radio waves: Radio/TV broadcasting, RFID.',
              '  2. Microwaves: Satellite communications, mobile phones, cooking food.',
              '  3. Infrared: TV remotes, thermal imaging, cooking (grills/toasters). Hazard: skin burns.',
              '  4. Visible light: Optical fibres, photography, human vision.',
              '  5. Ultraviolet (UV): Fluorescent lights, detecting forged banknotes. Hazard: sunburn, skin cancer, cataract blindness.',
              '  6. X-rays: Medical radiography (viewing broken bones), airport baggage security. Hazard: ionising, cell mutations/cancer.',
              '  7. Gamma rays: Radiotherapy cancer treatment, sterilising surgical instruments. Hazard: highly penetrating ionising radiation.'
            ]
          }
        ]
      }
    ]
  },

  {
    subtopicCode: 'P3.4',
    topicCode: 'P3',
    topicName: 'Waves',
    title: 'Sound, Echoes & Ultrasound',
    subject: 'physics',
    tier: 'Core & Supplement',
    syllabusSummary: [
      'Sound produced by vibrating sources; longitudinal wave; requires medium (cannot travel through vacuum).',
      'Speed in solids > liquids > gases; human audible range 20 Hz to 20,000 Hz; echo calculations: speed = 2d / t.',
      'Ultrasound as sound with f > 20 kHz; pre-natal scans and sonar.'
    ],
    decks: [
      {
        id: 'deck-p3-4',
        subtopicCode: 'P3.4',
        topicCode: 'P3',
        title: 'Sound Waves, Speed, Echoes & Ultrasound Scans',
        subtopicHeader: '[P3.4] Sound',
        classworkDate: '02/09/2025 - 04/09/2025',
        objectives: [
          'Describe sound as a longitudinal wave requiring a physical medium.',
          'Recall audible range (20 Hz - 20,000 Hz) and solve echo calculations (v = 2d / t).',
          'Describe medical pre-natal scanning using ultrasound.'
        ],
        keywords: ['sound', 'longitudinal', 'vacuum', 'echo', 'sonar', 'ultrasound', 'pre-natal scan'],
        slides: [
          {
            id: 'p3-4-s1',
            slideNumber: 1,
            subtopicHeader: '[P3.4] Sound Fundamentals',
            title: 'Nature of Sound & Echo Distance Calculations',
            slideType: 'theory',
            content: [
              '• Sound is a longitudinal wave produced by vibrating objects.',
              '• Requires a Medium: Sound cannot travel through a vacuum (demonstrated by electric bell in evacuated glass bell jar).',
              '• Speed: Fastest in solids (~5000 m/s), slower in liquids (~1500 m/s), slowest in gases (~330-340 m/s) because particles in solids are closely packed.',
              '• Human Audibility Range: 20 Hz to 20,000 Hz (20 kHz).',
              '• Echoes (Sound Reflection): Sound travels to barrier and reflects back. Total distance travelled is 2 × d -> Speed = 2d / t.'
            ]
          },
          {
            id: 'p3-4-s2',
            slideNumber: 2,
            subtopicHeader: '[P3.4] Ultrasound Technology',
            title: 'Ultrasound: Definition and Medical Uses',
            slideType: 'theory',
            content: [
              '• Ultrasound: Sound waves with frequency higher than 20,000 Hz (beyond upper human audible threshold).',
              '• Medical Pre-Natal Scans: Ultrasound pulses sent into pregnant mother\'s abdomen. When waves encounter boundary between different tissue densities (e.g. amniotic fluid and foetal bone), part of pulse reflects back. Timing of echoes creates real-time 2D/3D image.',
              '• Safety Advantage: Ultrasound is non-ionising and completely safe for developing unborn babies, unlike X-rays.'
            ]
          }
        ]
      }
    ]
  },

  {
    subtopicCode: 'P4.1.1',
    topicCode: 'P4',
    topicName: 'Electricity and magnetism',
    title: 'Electrical Charge',
    subject: 'physics',
    tier: 'Core & Supplement',
    syllabusSummary: [
      'Positive and negative charges; like charges repel, unlike charges attract.',
      'Charging by friction: electrons transferred; unit of charge is Coulomb (C).'
    ],
    decks: [
      {
        id: 'deck-p4-1-1',
        subtopicCode: 'P4.1.1',
        topicCode: 'P4',
        title: 'Electrostatics & Friction Charging',
        subtopicHeader: '[P4.1.1] Electrical charge',
        classworkDate: '20/07/2026',
        objectives: [
          'State properties of electric charge and describe electrostatic attraction and repulsion.',
          'Explain charging of insulating rods (polythene and perspex) by electron transfer.'
        ],
        keywords: ['electrostatic', 'electron transfer', 'coulomb', 'friction', 'attract', 'repel'],
        slides: [
          {
            id: 'p4-1-1-s1',
            slideNumber: 1,
            subtopicHeader: '[P4.1.1] Charge Rules',
            title: 'Positive, Negative Charges & Electron Transfer',
            slideType: 'theory',
            content: [
              '• Two types of electric charge: Positive (+) and Negative (-). Measured in Coulombs (C).',
              '• Law of Charges: Like charges REPEL; unlike charges ATTRACT.',
              '• Charging by Friction: When insulating rods are rubbed with a dry cloth, ELECTRONS are transferred (protons are fixed in nucleus and NEVER transfer!):',
              '  - Polythene Rod: Rubbed with duster -> electrons transfer from cloth onto rod -> polythene becomes NEGATIVELY charged.',
              '  - Perspex / Acetate Rod: Rubbed with duster -> electrons transfer from rod to cloth -> rod becomes POSITIVELY charged.'
            ]
          }
        ]
      }
    ]
  },

  {
    subtopicCode: 'P4.1.2',
    topicCode: 'P4',
    topicName: 'Electricity and magnetism',
    title: 'Electric Current',
    subject: 'physics',
    tier: 'Core & Supplement',
    syllabusSummary: [
      'Current as rate of flow of charge: I = Q / t (Amperes, A; 1 A = 1 C/s).',
      'Conventional current (positive to negative) vs electron flow (negative to positive); ammeters connected in series.'
    ],
    decks: [
      {
        id: 'deck-p4-1-2',
        subtopicCode: 'P4.1.2',
        topicCode: 'P4',
        title: 'Current, Charge & Ammeter Connections',
        subtopicHeader: '[P4.1.2] Current',
        classworkDate: '21/07/2026',
        objectives: [
          'Define current as rate of flow of charge: I = Q / t.',
          'Contrast conventional current with electron flow and explain ammeter series placement.'
        ],
        keywords: ['current', 'amperes', 'charge', 'coulombs', 'ammeter', 'series', 'conventional current'],
        slides: [
          {
            id: 'p4-1-2-s1',
            slideNumber: 1,
            subtopicHeader: '[P4.1.2] Current Equation',
            title: 'Electric Current Equation (I = Q / t)',
            slideType: 'math',
            content: [
              '• Electric Current (I): Rate of flow of electric charge around a circuit -> Current = Charge ÷ Time -> I = Q / t (where I is in Amperes A, Q in Coulombs C, and t in seconds s).',
              '• Conventional Current vs Electron Flow:',
              '  - Conventional Current: Flows from POSITIVE (+) terminal to NEGATIVE (-) terminal.',
              '  - Actual Electron Flow: Negatively charged electrons flow from NEGATIVE (-) terminal to POSITIVE (+) terminal.',
              '• Measurement: Ammeter has negligible resistance and must ALWAYS be connected in SERIES.'
            ]
          }
        ]
      }
    ]
  },

  {
    subtopicCode: 'P4.1.3',
    topicCode: 'P4',
    topicName: 'Electricity and magnetism',
    title: 'Electromotive Force & Potential Difference',
    subject: 'physics',
    tier: 'Core & Supplement',
    syllabusSummary: [
      'e.m.f. as electrical energy provided per unit charge by a power source (V = W / Q).',
      'Potential difference (p.d.) as energy dissipated per unit charge across a component (V = W / Q); voltmeter connected in parallel.'
    ],
    decks: [
      {
        id: 'deck-p4-1-3',
        subtopicCode: 'P4.1.3',
        topicCode: 'P4',
        title: 'Voltage: e.m.f., p.d. & Voltmeter Placement',
        subtopicHeader: '[P4.1.3] Voltage (e.m.f and p.d)',
        classworkDate: '22/07/2026',
        objectives: [
          'Distinguish between electromotive force (e.m.f.) and potential difference (p.d.).',
          'Explain voltmeter parallel connection.'
        ],
        keywords: ['emf', 'potential difference', 'volts', 'joules per coulomb', 'voltmeter', 'parallel'],
        slides: [
          {
            id: 'p4-1-3-s1',
            slideNumber: 1,
            subtopicHeader: '[P4.1.3] e.m.f. vs p.d.',
            title: 'e.m.f. vs Potential Difference (p.d.)',
            slideType: 'theory',
            content: [
              '• Electromotive Force (e.m.f.): The electrical energy supplied by a cell/battery per unit charge in driving charge round a complete circuit -> 1 Volt = 1 Joule per Coulomb (1 V = 1 J/C).',
              '• Potential Difference (p.d. / Voltage): The electrical energy converted into other forms (e.g. heat, light) per unit charge as charge passes through a component -> V = W / Q.',
              '• Voltmeter Connection: Voltmeters have extremely high resistance and must ALWAYS be connected in PARALLEL across the component being measured.'
            ]
          }
        ]
      }
    ]
  },

  {
    subtopicCode: 'P4.1.4',
    topicCode: 'P4',
    topicName: 'Electricity and magnetism',
    title: 'Resistance & Ohm\'s Law',
    subject: 'physics',
    tier: 'Core & Supplement',
    syllabusSummary: [
      'Define resistance: R = V / I (Ohms, Ω).',
      'Ohm\'s law; IV characteristics for ohmic resistor, filament lamp, diode.',
      'Factors affecting wire resistance: length (R ∝ L), cross-sectional area (R ∝ 1/A).'
    ],
    decks: [
      {
        id: 'deck-p4-1-4',
        subtopicCode: 'P4.1.4',
        topicCode: 'P4',
        title: 'Ohm\'s Law & Wire Resistance Practical',
        subtopicHeader: '[P4.1.4] Factors which affect Resistance',
        classworkDate: '23/07/2026 - 28/07/2026',
        objectives: [
          'State Ohm\'s law and calculate resistance using R = V / I.',
          'Investigate wire resistance factors: length and cross-sectional area.'
        ],
        keywords: ['resistance', 'ohms', 'Ohm\'s law', 'nichrome wire', 'filament lamp', 'variable resistor'],
        slides: [
          {
            id: 'p4-1-4-s1',
            slideNumber: 1,
            subtopicHeader: '[P4.1.4] Ohm\'s Law Formula',
            title: 'Resistance & Ohm\'s Law Equation',
            slideType: 'math',
            content: [
              '• Resistance (R): Opposition to electric current flow -> Resistance = Voltage ÷ Current -> R = V / I (Ohms, Ω).',
              '• Ohm\'s Law: Current through a conductor is directly proportional to the potential difference across it, provided temperature remains constant (straight line through origin on I-V graph).',
              '• Filament Lamp: As current increases, filament heats up -> positive metal ions vibrate more vigorously -> higher collision frequency with electrons -> RESISTANCE INCREASES (I-V graph curves).'
            ]
          },
          {
            id: 'p4-1-4-p1',
            slideNumber: 2,
            subtopicHeader: '[P4.1.4] Wire Factors Practical',
            title: 'Investigating Factors Affecting Resistance of a Wire',
            slideType: 'practical',
            content: [
              '• Wire Length: Resistance is directly proportional to length (R ∝ L). Doubling wire length doubles resistance because electrons collide with twice as many metal ions.',
              '• Wire Thickness / Cross-Sectional Area: Resistance is inversely proportional to cross-sectional area (R ∝ 1/A). A thicker wire has lower resistance because more parallel paths exist for electrons.',
              '• Material: Different metals have different intrinsic resistivity (copper has much lower resistance than nichrome).'
            ]
          }
        ]
      }
    ]
  },

  {
    subtopicCode: 'P4.1.5',
    topicCode: 'P4',
    topicName: 'Electricity and magnetism',
    title: 'Electrical Energy & Power',
    subject: 'physics',
    tier: 'Core & Supplement',
    syllabusSummary: [
      'Equations for electrical power: P = I × V and P = I²R.',
      'Electrical energy transferred: E = P × t = I × V × t (Joules, J or kWh).'
    ],
    decks: [
      {
        id: 'deck-p4-1-5',
        subtopicCode: 'P4.1.5',
        topicCode: 'P4',
        title: 'Electrical Power & Energy Calculations',
        subtopicHeader: '[P4.1.5] Electrical energy and Power',
        classworkDate: '29/07/2026',
        objectives: [
          'Calculate electrical power using P = I × V and P = I²R.',
          'Calculate electrical energy transferred using E = I × V × t.'
        ],
        keywords: ['electrical power', 'watts', 'joules', 'voltage', 'current'],
        slides: [
          {
            id: 'p4-1-5-s1',
            slideNumber: 1,
            subtopicHeader: '[P4.1.5] Power Formulas',
            title: 'Electrical Power & Energy Formulas',
            slideType: 'math',
            content: [
              '• Electrical Power (P): Rate of electrical energy transfer:',
              '  - P = I × V (Power in Watts = Current in Amperes × Voltage in Volts)',
              '  - Since V = IR, substituting gives: P = I² × R',
              '  - Also: P = V² ÷ R',
              '• Electrical Energy Transferred (E):',
              '  - E = P × t = I × V × t (Energy in Joules, time in seconds).'
            ]
          }
        ]
      }
    ]
  },

  {
    subtopicCode: 'P4.2.1',
    topicCode: 'P4',
    topicName: 'Electricity and magnetism',
    title: 'Circuit Diagrams & Components',
    subject: 'physics',
    tier: 'Core',
    syllabusSummary: [
      'Draw and interpret circuit diagrams with standard symbols: switch, cell, battery, power supply, resistor, variable resistor, lamp, ammeter, voltmeter, fuse, thermistor, LDR.'
    ],
    decks: [
      {
        id: 'deck-p4-2-1',
        subtopicCode: 'P4.2.1',
        topicCode: 'P4',
        title: 'Circuit Symbols & Circuit Diagram Construction',
        subtopicHeader: '[P4.2.1] Circuit Symbols',
        classworkDate: '30/07/2026',
        objectives: [
          'Recognize and draw standard circuit symbols.',
          'Construct series and parallel circuit diagrams correctly.'
        ],
        keywords: ['circuit symbols', 'cell', 'battery', 'switch', 'fuse', 'thermistor', 'LDR'],
        slides: [
          {
            id: 'p4-2-1-s1',
            slideNumber: 1,
            subtopicHeader: '[P4.2.1] Symbols Reference',
            title: 'Standard Electrical Circuit Symbols',
            slideType: 'theory',
            content: [
              '• Cell: Long thin line (+) and short thick line (-).',
              '• Battery: Two or more cells connected in series.',
              '• Resistor: Simple blank rectangle.',
              '• Variable Resistor: Rectangle with diagonal arrow across it.',
              '• Thermistor: Rectangle with hockey-stick line through it (resistance decreases as temperature rises).',
              '• Light-Dependent Resistor (LDR): Rectangle in circle with arrows pointing in (resistance decreases in bright light).',
              '• Diode: Triangle pointing to vertical line in a circle (allows current in one direction only).'
            ]
          }
        ]
      }
    ]
  },

  {
    subtopicCode: 'P4.2.2',
    topicCode: 'P4',
    topicName: 'Electricity and magnetism',
    title: 'Series & Parallel Circuits',
    subject: 'physics',
    tier: 'Core & Supplement',
    syllabusSummary: [
      'Series: current is same everywhere (I1 = I2); total p.d. sum of individual p.d.s (VT = V1 + V2); total resistance RT = R1 + R2.',
      'Parallel: p.d. is same across branches; total current sum of branches (IT = I1 + I2); 1/RT = 1/R1 + 1/R2; advantage of parallel in domestic wiring.'
    ],
    decks: [
      {
        id: 'deck-p4-2-2',
        subtopicCode: 'P4.2.2',
        topicCode: 'P4',
        title: 'Series vs Parallel Circuit Rules & Resistance',
        subtopicHeader: '[P4.2.2] Series and Parallel Circuits',
        classworkDate: '04/08/2026 - 06/08/2026',
        objectives: [
          'State current, voltage, and resistance rules for series circuits.',
          'State rules for parallel circuits and calculate parallel resistance: 1/RT = 1/R1 + 1/R2.'
        ],
        keywords: ['series', 'parallel', 'combined resistance', 'domestic lighting', 'branch'],
        slides: [
          {
            id: 'p4-2-2-s1',
            slideNumber: 1,
            subtopicHeader: '[P4.2.2] Circuit Rules Summary',
            title: 'Series vs Parallel Circuit Rules',
            slideType: 'theory',
            content: [
              '• Series Circuits:',
              '  - Current: Identical at all points: I_total = I1 = I2 = I3.',
              '  - Voltage: Shared across components: V_total = V1 + V2 + ...',
              '  - Total Resistance: RT = R1 + R2 + R3.',
              '• Parallel Circuits:',
              '  - Voltage: Identical across every parallel branch: V_total = V1 = V2.',
              '  - Current: Splits between branches: I_total = I1 + I2 + ...',
              '  - Total Resistance: 1/RT = 1/R1 + 1/R2 (Total resistance is ALWAYS less than the smallest individual resistor).',
              '• Why Domestic Lighting is Parallel: 1) Each lamp receives full mains voltage (230 V); 2) Each lamp can be switched independently; 3) If one bulb blows, all other bulbs remain on.'
            ]
          }
        ]
      }
    ]
  },

  {
    subtopicCode: 'P4.3',
    topicCode: 'P4',
    topicName: 'Electricity and magnetism',
    title: 'Electrical Safety',
    subject: 'physics',
    tier: 'Core',
    syllabusSummary: [
      'Hazards: damaged insulation, overheating cables, damp conditions.',
      'Safety devices: fuses, circuit breakers, earth wire; double insulation.'
    ],
    decks: [
      {
        id: 'deck-p4-3',
        subtopicCode: 'P4.3',
        topicCode: 'P4',
        title: 'Electrical Hazards, Fuses, Earthing & Double Insulation',
        subtopicHeader: '[P4.3] Electrical Safety',
        classworkDate: '11/08/2026',
        objectives: [
          'Identify electrical hazards (damp conditions, damaged insulation, overloaded sockets).',
          'Explain how fuses, circuit breakers, earth wires, and double insulation prevent fire and electrocution.'
        ],
        keywords: ['fuse', 'circuit breaker', 'earth wire', 'live wire', 'neutral wire', 'double insulation'],
        slides: [
          {
            id: 'p4-3-s1',
            slideNumber: 1,
            subtopicHeader: '[P4.3] Safety Devices',
            title: 'Fuses, Earthing and Double Insulation',
            slideType: 'theory',
            content: [
              '• 3-Pin Plug Wires: Live wire (Brown, carries 230V alternating voltage); Neutral wire (Blue, completes circuit at 0V); Earth wire (Green/Yellow stripes, safety wire connected to metal casing).',
              '• Fuse: Thin wire with low melting point placed in LIVE wire. If current exceeds fuse rating (e.g. 3A, 5A, 13A), wire melts, breaking the circuit and preventing fire.',
              '• Earthing System: If live wire frays and touches metal appliance casing, large current surges down low-resistance earth wire directly to ground -> blows fuse immediately -> protects user from lethal electric shock.',
              '• Double Insulation: Appliances with plastic, non-conductive casing require no earth wire (symbol: square inside a square).'
            ]
          }
        ]
      }
    ]
  },

  {
    subtopicCode: 'P4.4',
    topicCode: 'P4',
    topicName: 'Electricity and magnetism',
    title: 'Electromagnetic Converters',
    subject: 'physics',
    tier: 'Core',
    syllabusSummary: [
      'Simple generators (kinetic to electrical via electromagnetic induction) and electric motors (electrical to kinetic via motor effect).'
    ],
    decks: [
      {
        id: 'deck-p4-4',
        subtopicCode: 'P4.4',
        topicCode: 'P4',
        title: 'Energy Converters: Electric Motors & Generators',
        subtopicHeader: '[P4.4] Energy Converters',
        classworkDate: '12/08/2026',
        objectives: [
          'Describe energy conversions in simple electric motors and generators.',
          'Differentiate motor effect from electromagnetic induction.'
        ],
        keywords: ['electric motor', 'generator', 'electromagnetic induction', 'motor effect'],
        slides: [
          {
            id: 'p4-4-s1',
            slideNumber: 1,
            subtopicHeader: '[P4.4] Motors vs Generators',
            title: 'Motors vs Generators: Energy Conversions',
            slideType: 'theory',
            content: [
              '• Electric Motor (Motor Effect): Converts ELECTRICAL energy into KINETIC (rotational mechanical) energy. Current flowing through a coil in a magnetic field experiences a force, causing it to spin.',
              '• Electric Generator (Electromagnetic Induction): Converts KINETIC (mechanical) energy into ELECTRICAL energy. Rotating a coil inside a magnetic field cuts magnetic field lines, inducing an electromotive force (e.m.f.) and generating an alternating current.'
            ]
          }
        ]
      }
    ]
  },

  {
    subtopicCode: 'P5.1.1',
    topicCode: 'P5',
    topicName: 'Space physics',
    title: 'The Solar System',
    subject: 'physics',
    tier: 'Core',
    syllabusSummary: [
      'Planets in order from Sun: Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune (My Very Easy Method Just Speeds Up Naming).',
      'Inner rocky planets vs outer gas giants; moons, asteroids, comets; elliptical orbits.'
    ],
    decks: [
      {
        id: 'deck-p5-1-1',
        subtopicCode: 'P5.1.1',
        topicCode: 'P5',
        title: 'Planets of the Solar System & Planetary Orbits',
        subtopicHeader: '[P5.1.1] The Solar System',
        classworkDate: '17/08/2026',
        objectives: [
          'Recall order of eight planets from the Sun.',
          'Differentiate inner rocky planets from outer gas giants.'
        ],
        keywords: ['solar system', 'rocky planets', 'gas giants', 'elliptical orbit', 'asteroid', 'comet'],
        slides: [
          {
            id: 'p5-1-1-s1',
            slideNumber: 1,
            subtopicHeader: '[P5.1.1] Solar System Order',
            title: 'Order and Classification of Planets',
            slideType: 'theory',
            content: [
              '• Order from Sun: Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune.',
              '• Inner Terrestrial (Rocky) Planets: Mercury, Venus, Earth, Mars (small, high density, solid rock).',
              '• Asteroid Belt: Band of rocky debris orbiting between Mars and Jupiter.',
              '• Outer Gas Giants & Ice Giants: Jupiter, Saturn, Uranus, Neptune (massive, low density, composed primarily of hydrogen, helium, methane).',
              '• Orbits: Planets orbit the Sun in slightly elliptical paths held by gravitational attraction.'
            ]
          }
        ]
      }
    ]
  },

  {
    subtopicCode: 'P5.2.1',
    topicCode: 'P5',
    topicName: 'Space physics',
    title: 'The Sun, Light-Years & Orbital Speed',
    subject: 'physics',
    tier: 'Core & Supplement',
    syllabusSummary: [
      'Sun as a medium-sized star powered by nuclear fusion of hydrogen into helium.',
      'Define light-year as distance travelled by light in one year (~9.5 × 10¹⁵ m).',
      'Orbital speed equation: v = 2πr / T.'
    ],
    decks: [
      {
        id: 'deck-p5-2-1',
        subtopicCode: 'P5.2.1',
        topicCode: 'P5',
        title: 'Sun Nuclear Fusion, Light-Years & v = 2πr / T',
        subtopicHeader: '[P5.2.1] Light Years & Orbital Speed',
        classworkDate: '18/08/2026',
        objectives: [
          'State that the Sun is powered by nuclear fusion of hydrogen into helium.',
          'Define light-year and calculate orbital speed using v = 2πr / T.'
        ],
        keywords: ['nuclear fusion', 'hydrogen', 'helium', 'light-year', 'orbital speed'],
        slides: [
          {
            id: 'p5-2-1-s1',
            slideNumber: 1,
            subtopicHeader: '[P5.2.1] Orbital Speed & Light-Years',
            title: 'Orbital Speed (v = 2πr/T) & Light-Years',
            slideType: 'math',
            content: [
              '• Power Source of the Sun: Nuclear fusion in core fuses hydrogen nuclei into helium nuclei at extreme temperature (~15 million °C) and pressure, releasing vast radiant energy.',
              '• Light-Year (ly): The distance light travels through a vacuum in one Earth year = speed of light c × seconds in a year = (3.0 × 10⁸ m/s) × (365.25 × 24 × 3600 s) ≈ 9.5 × 10¹⁵ m.',
              '• Orbital Speed: For circular orbit of radius r and period T -> Orbital Speed v = (Circumference 2πr) ÷ Time T -> v = 2πr / T.'
            ]
          }
        ]
      }
    ]
  },

  {
    subtopicCode: 'P5.2.2',
    topicCode: 'P5',
    topicName: 'Space physics',
    title: 'Life Cycle of Stars',
    subject: 'physics',
    tier: 'Core & Supplement',
    syllabusSummary: [
      'Protostar -> main sequence star (balanced gravitational collapse vs outward radiation pressure).',
      'Low mass stars (Sun-like): red giant -> planetary nebula -> white dwarf -> black dwarf.',
      'High mass stars: red supergiant -> supernova -> neutron star or black hole.'
    ],
    decks: [
      {
        id: 'deck-p5-2-2',
        subtopicCode: 'P5.2.2',
        topicCode: 'P5',
        title: 'Life Cycle of Stars: Sun vs Massive Stars',
        subtopicHeader: '[P5.2.2] Life Cycle of Stars',
        classworkDate: '19/08/2026',
        objectives: [
          'Explain stability of main sequence stars (equilibrium of gravity and thermal radiation pressure).',
          'Trace evolutionary pathways of Sun-like stars and massive stars.'
        ],
        keywords: ['nebula', 'protostar', 'main sequence', 'red giant', 'white dwarf', 'supernova', 'neutron star', 'black hole'],
        slides: [
          {
            id: 'p5-2-2-s1',
            slideNumber: 1,
            subtopicHeader: '[P5.2.2] Stellar Evolution',
            title: 'Stellar Evolutionary Stages',
            slideType: 'theory',
            content: [
              '• Star Formation: Interstellar cloud of dust and gas (nebula) collapses under gravity forming a protostar until core temperature triggers nuclear fusion.',
              '• Main Sequence Equilibrium: Inward gravitational pull is perfectly balanced by outward thermal pressure from nuclear fusion reactions.',
              '• Sun-Sized Star Pathway: Nebula -> Protostar -> Main Sequence -> Red Giant (core runs out of hydrogen, expands and cools) -> Planetary Nebula -> White Dwarf (dense hot carbon core) -> Black Dwarf.',
              '• Massive Star Pathway (>8 solar masses): Nebula -> Protostar -> Massive Main Sequence -> Red Supergiant -> SUPERNOVA explosion -> NEUTRON STAR or BLACK HOLE (infinite gravitational density).'
            ]
          }
        ]
      }
    ]
  },

  {
    subtopicCode: 'P5.2.3',
    topicCode: 'P5',
    topicName: 'Space physics',
    title: 'Galaxies & The Universe',
    subject: 'physics',
    tier: 'Core & Supplement',
    syllabusSummary: [
      'Milky Way is a spiral galaxy containing billions of stars; Universe contains billions of galaxies.',
      'Redshift of light from distant galaxies (Hubble expansion); evidence for Big Bang theory.'
    ],
    decks: [
      {
        id: 'deck-p5-2-3',
        subtopicCode: 'P5.2.3',
        topicCode: 'P5',
        title: 'The Milky Way, Redshift & The Expanding Universe',
        subtopicHeader: '[P5.2.3] Galaxies and the Universe',
        classworkDate: '20/08/2026',
        objectives: [
          'Describe the Milky Way as a spiral galaxy with billions of stars.',
          'Explain redshift evidence for the Big Bang and expanding universe.'
        ],
        keywords: ['Milky Way', 'galaxy', 'Big Bang', 'redshift', 'Doppler effect', 'universe'],
        slides: [
          {
            id: 'p5-2-3-s1',
            slideNumber: 1,
            subtopicHeader: '[P5.2.3] Cosmology',
            title: 'Milky Way Galaxy & The Expanding Universe',
            slideType: 'theory',
            content: [
              '• The Milky Way: Our Solar System is located on a spiral arm of the Milky Way galaxy, which contains over 100 billion stars and measures ~100,000 light-years across.',
              '• Galactic Redshift: Light spectra from distant galaxies show absorption lines shifted towards the longer-wavelength red end of the spectrum.',
              '• Conclusion: More distant galaxies exhibit greater redshift, proving that distant galaxies are receding faster and space itself is expanding.',
              '• The Big Bang Theory: If the universe is expanding outwards, tracing backwards in time indicates all matter and space originated from an infinitely hot, dense point ~13.8 billion years ago.'
            ]
          }
        ]
      }
    ]
  }
];
