import { QuizQuestion } from '../types';

/**
 * Authentic Cambridge IGCSE Combined Science 0653 Physics Subtopic Questions.
 * Strictly aligned with Paper 2 Multiple Choice syllabus learning objectives.
 */
export const PHYSICS_SUBTOPIC_QUESTIONS: Record<string, QuizQuestion[]> = {
  // P1.5.1 Forces & Friction
  'P1.5.1': [
    {
      id: 'p1-5-1-q1',
      subject: 'physics',
      topicCode: 'P1',
      syllabusRef: 'P1.5.1',
      question: 'A rocket of mass 1200 kg accelerates upwards at 4.0 m/s². What resultant force acts on the rocket?',
      options: [
        '4800 N',
        '300 N',
        '1200 N',
        '16800 N'
      ],
      correctIndex: 0,
      explanation: 'Newton’s second law: Resultant force F = mass m × acceleration a = 1200 kg × 4.0 m/s² = 4800 N.'
    },
    {
      id: 'p1-5-1-q2',
      subject: 'physics',
      topicCode: 'P1',
      syllabusRef: 'P1.5.1',
      question: 'A skydiver falls vertically at constant terminal velocity. Which statement about the forces acting on the skydiver is correct?',
      options: [
        'The upward air resistance (drag) equals the downward weight, so the resultant force is zero',
        'Weight is greater than air resistance, producing downward acceleration',
        'Air resistance is greater than weight, slowing the skydiver down',
        'There are no forces acting on the skydiver in free fall'
      ],
      correctIndex: 0,
      explanation: 'At terminal velocity, velocity is constant (a = 0). By Newton’s first law, balanced forces mean upward drag equals downward weight, resulting in zero net force.'
    },
    {
      id: 'p1-5-1-q3',
      subject: 'physics',
      topicCode: 'P1',
      syllabusRef: 'P1.5.1',
      question: 'Two forces act on a wooden block: 15 N to the right and 9 N to the left. What is the magnitude and direction of the resultant force?',
      options: [
        '6 N to the right',
        '24 N to the right',
        '6 N to the left',
        '135 N downwards'
      ],
      correctIndex: 0,
      explanation: 'Resultant force = 15 N - 9 N = 6 N in the direction of the larger force (to the right).'
    }
  ],

  // P1.6.1 - P1.6.4 Work, Energy & Power
  'P1.6.1': [
    {
      id: 'p1-6-1-q1',
      subject: 'physics',
      topicCode: 'P1',
      syllabusRef: 'P1.6.1',
      question: 'A ball of mass 0.5 kg is dropped from a height of 8.0 m. Assuming air resistance is negligible and g = 9.8 N/kg, what is its gravitational potential energy (Ep) just before release?',
      options: [
        '39.2 J',
        '4.0 J',
        '78.4 J',
        '19.6 J'
      ],
      correctIndex: 0,
      explanation: 'Gravitational potential energy Ep = m × g × h = 0.5 kg × 9.8 N/kg × 8.0 m = 39.2 J.'
    },
    {
      id: 'p1-6-1-q2',
      subject: 'physics',
      topicCode: 'P1',
      syllabusRef: 'P1.6.1',
      question: 'What is the kinetic energy of a car of mass 1000 kg traveling at a speed of 20 m/s?',
      options: [
        '200,000 J (200 kJ)',
        '10,000 J (10 kJ)',
        '400,000 J (400 kJ)',
        '20,000 J (20 kJ)'
      ],
      correctIndex: 0,
      explanation: 'Kinetic energy Ek = 0.5 × m × v² = 0.5 × 1000 kg × (20 m/s)² = 0.5 × 1000 × 400 = 200,000 J.'
    }
  ],
  'P1.6.2': [
    {
      id: 'p1-6-2-q1',
      subject: 'physics',
      topicCode: 'P1',
      syllabusRef: 'P1.6.2',
      question: 'An electric motor is supplied with 500 J of electrical energy. It outputs 350 J of useful mechanical work. What is the efficiency of the motor?',
      options: [
        '70%',
        '30%',
        '15%',
        '85%'
      ],
      correctIndex: 0,
      explanation: 'Efficiency = (useful energy output / total energy input) × 100 = (350 J / 500 J) × 100 = 70%.'
    },
    {
      id: 'p1-6-2-q2',
      subject: 'physics',
      topicCode: 'P1',
      syllabusRef: 'P1.6.2',
      question: 'A force of 60 N is used to push a box across a horizontal floor through a distance of 4.0 m. How much work is done on the box?',
      options: [
        '240 J',
        '15 J',
        '64 J',
        '120 J'
      ],
      correctIndex: 0,
      explanation: 'Work done W = Force F × distance d in direction of force = 60 N × 4.0 m = 240 J.'
    }
  ],
  'P1.6.4': [
    {
      id: 'p1-6-4-q1',
      subject: 'physics',
      topicCode: 'P1',
      syllabusRef: 'P1.6.4',
      question: 'A crane lifts a load doing 12,000 J of work in 30 seconds. What is the power output of the crane?',
      options: [
        '400 W',
        '360,000 W',
        '300 W',
        '240 W'
      ],
      correctIndex: 0,
      explanation: 'Power P = Work done W / time t = 12,000 J / 30 s = 400 W.'
    }
  ],

  // P1.7 Pressure
  'P1.7': [
    {
      id: 'p1-7-q1',
      subject: 'physics',
      topicCode: 'P1',
      syllabusRef: 'P1.7',
      question: 'A force of 300 N acts perpendicular to a flat surface with an area of 0.05 m². What pressure is exerted on the surface?',
      options: [
        '6000 Pa',
        '15 Pa',
        '1500 Pa',
        '60 Pa'
      ],
      correctIndex: 0,
      explanation: 'Pressure P = Force F / Area A = 300 N / 0.05 m² = 6000 Pa (or N/m²).'
    },
    {
      id: 'p1-7-q2',
      subject: 'physics',
      topicCode: 'P1',
      syllabusRef: 'P1.7',
      question: 'Why does an elephant exert less pressure on the ground than a person standing on high-heeled shoes, despite the elephant having a much larger mass?',
      options: [
        'The elephant’s four feet have a very large contact area, spreading the force and reducing pressure (P = F / A)',
        'The elephant does not have gravitational weight on sand',
        'High heels increase the surface area in contact with the floor',
        'Pressure depends only on height, not on contact area'
      ],
      correctIndex: 0,
      explanation: 'Pressure is inversely proportional to surface area (P = F/A). The large area of an elephant’s feet results in a low pressure, while narrow stilettos concentrate weight over a tiny area.'
    }
  ],

  // P2.1.3 Gas Laws & Boyle's Law
  'P2.1.3': [
    {
      id: 'p2-1-3-q1',
      subject: 'physics',
      topicCode: 'P2',
      syllabusRef: 'P2.1.3',
      question: 'A fixed mass of gas at constant temperature occupies a volume of 60 cm³ at a pressure of 100 kPa. The gas is compressed to a volume of 20 cm³. What is the new pressure?',
      options: [
        '300 kPa',
        '33.3 kPa',
        '120 kPa',
        '200 kPa'
      ],
      correctIndex: 0,
      explanation: 'Boyle’s Law (p1V1 = p2V2): p2 = (p1 × V1) / V2 = (100 kPa × 60 cm³) / 20 cm³ = 300 kPa.'
    },
    {
      id: 'p2-1-3-q2',
      subject: 'physics',
      topicCode: 'P2',
      syllabusRef: 'P2.1.3',
      question: 'Why does the pressure of a fixed mass of gas increase when its volume is reduced at constant temperature?',
      options: [
        'Gas particles have less space to move, colliding with container walls more frequently per unit area',
        'The gas particles increase in individual diameter and mass',
        'The particles gain kinetic energy and move at higher average speeds',
        'The number of gas molecules multiplies inside the smaller space'
      ],
      correctIndex: 0,
      explanation: 'At constant temperature, particle speed remains constant. In a smaller volume, particles travel shorter distances between collisions with the container walls, increasing collision frequency per unit area.'
    }
  ],

  // P2.3.1 - P2.3.3 Thermal Conduction, Convection & Radiation
  'P2.3.1': [
    {
      id: 'p2-3-1-q1',
      subject: 'physics',
      topicCode: 'P2',
      syllabusRef: 'P2.3.1',
      question: 'Why are metals much better thermal conductors than non-metals such as wood or plastic?',
      options: [
        'Metals contain free delocalised electrons that rapidly transfer kinetic energy through the lattice, in addition to lattice vibrations',
        'Metals have lower density than non-metals',
        'Metals absorb radiation from the sun faster',
        'Wood and plastic have no atoms to vibrate'
      ],
      correctIndex: 0,
      explanation: 'Non-metals transfer heat solely by slow lattice vibrations between adjacent atoms. Metals have delocalised conduction electrons that move freely through the lattice, diffusing kinetic energy rapidly.'
    }
  ],
  'P2.3.3': [
    {
      id: 'p2-3-3-q1',
      subject: 'physics',
      topicCode: 'P2',
      syllabusRef: 'P2.3.3',
      question: 'A Leslie cube filled with boiling water has four vertical faces: matt black, shiny silver, white, and dull grey. Which face emits infrared thermal radiation at the highest rate?',
      options: [
        'The matt black face',
        'The shiny silver face',
        'The white face',
        'All faces emit radiation at identical rates because temperature is equal'
      ],
      correctIndex: 0,
      explanation: 'Matt black surfaces are the best emitters (and best absorbers) of infrared radiation. Shiny silver surfaces are poor emitters and good reflectors.'
    }
  ],

  // P3.1 Waves
  'P3.1': [
    {
      id: 'p3-1-q1',
      subject: 'physics',
      topicCode: 'P3',
      syllabusRef: 'P3.1',
      question: 'A water wave has a frequency of 5.0 Hz and a wavelength of 0.40 m. What is the speed of the wave?',
      options: [
        '2.0 m/s',
        '12.5 m/s',
        '0.08 m/s',
        '20 m/s'
      ],
      correctIndex: 0,
      explanation: 'Wave speed v = frequency f × wavelength λ = 5.0 Hz × 0.40 m = 2.0 m/s.'
    },
    {
      id: 'p3-1-q2',
      subject: 'physics',
      topicCode: 'P3',
      syllabusRef: 'P3.1',
      question: 'Which of the following is a longitudinal wave rather than a transverse wave?',
      options: [
        'Sound waves in air',
        'Visible light waves',
        'Radio waves',
        'Water surface ripples'
      ],
      correctIndex: 0,
      explanation: 'Sound waves are longitudinal: particle oscillations are parallel to the direction of wave energy propagation, forming compressions and rarefactions.'
    }
  ],

  // P3.2.1 - P3.2.2 Reflection & Refraction
  'P3.2.1': [
    {
      id: 'p3-2-1-q1',
      subject: 'physics',
      topicCode: 'P3',
      syllabusRef: 'P3.2.1',
      question: 'A ray of light strikes a plane mirror with an angle of incidence of 35°. What is the angle of reflection measured between the reflected ray and the normal?',
      options: [
        '35°',
        '55°',
        '70°',
        '90°'
      ],
      correctIndex: 0,
      explanation: 'The Law of Reflection states that the angle of incidence equals the angle of reflection (i = r = 35°), both measured from the normal.'
    }
  ],
  'P3.2.2': [
    {
      id: 'p3-2-2-q1',
      subject: 'physics',
      topicCode: 'P3',
      syllabusRef: 'P3.2.2',
      question: 'A ray of light travels from air into a rectangular glass block at an angle of 40° to the normal. What happens to the ray as it enters the glass?',
      options: [
        'It slows down and refracts towards the normal (angle of refraction is less than 40°)',
        'It speeds up and refracts away from the normal',
        'It continues in a straight line with no deviation',
        'It undergoes total internal reflection back into air'
      ],
      correctIndex: 0,
      explanation: 'Glass is optically denser than air. Light travels slower in glass, bending towards the normal line so that r < i.'
    }
  ],

  // P3.3 Electromagnetic Spectrum
  'P3.3': [
    {
      id: 'p3-3-q1',
      subject: 'physics',
      topicCode: 'P3',
      syllabusRef: 'P3.3',
      question: 'Which electromagnetic wave has the highest frequency and shortest wavelength in the electromagnetic spectrum?',
      options: [
        'Gamma rays',
        'Radio waves',
        'Microwaves',
        'Visible light'
      ],
      correctIndex: 0,
      explanation: 'In order of increasing frequency: Radio, Microwave, Infrared, Visible, UV, X-ray, Gamma. Gamma rays have the highest frequency and greatest photon energy.'
    },
    {
      id: 'p3-3-q2',
      subject: 'physics',
      topicCode: 'P3',
      syllabusRef: 'P3.3',
      question: 'What is the speed of all electromagnetic waves in a vacuum?',
      options: [
        '3.0 × 10⁸ m/s',
        '330 m/s',
        '3.0 × 10⁶ m/s',
        'Infinite speed'
      ],
      correctIndex: 0,
      explanation: 'All electromagnetic waves travel at the speed of light c = 3.0 × 10⁸ m/s in a vacuum.'
    }
  ],

  // P3.4 Sound
  'P3.4': [
    {
      id: 'p3-4-q1',
      subject: 'physics',
      topicCode: 'P3',
      syllabusRef: 'P3.4',
      question: 'What is the approximate range of audible sound frequencies for a healthy human ear?',
      options: [
        '20 Hz to 20,000 Hz (20 kHz)',
        '2 Hz to 200 Hz',
        '200 kHz to 20 MHz',
        '1000 Hz to 100,000 Hz'
      ],
      correctIndex: 0,
      explanation: 'The standard human audible frequency range is 20 Hz to 20,000 Hz. Frequencies above 20 kHz are ultrasound.'
    },
    {
      id: 'p3-4-q2',
      subject: 'physics',
      topicCode: 'P3',
      syllabusRef: 'P3.4',
      question: 'A ship uses an echo sounder to measure water depth. A sound pulse travels to the seabed and returns in 0.80 s. The speed of sound in water is 1500 m/s. What is the depth of water?',
      options: [
        '600 m',
        '1200 m',
        '1875 m',
        '300 m'
      ],
      correctIndex: 0,
      explanation: 'Total two-way distance = speed × time = 1500 m/s × 0.80 s = 1200 m. Depth = distance / 2 = 1200 m / 2 = 600 m.'
    }
  ],

  // P4.1 - P4.2 Electricity & Circuits
  'P4.1.2': [
    {
      id: 'p4-1-2-q1',
      subject: 'physics',
      topicCode: 'P4',
      syllabusRef: 'P4.1.2',
      question: 'A charge of 45 C flows through an electric lamp in 15 seconds. What is the current in the lamp?',
      options: [
        '3.0 A',
        '675 A',
        '0.33 A',
        '30 A'
      ],
      correctIndex: 0,
      explanation: 'Current I = Charge Q / time t = 45 C / 15 s = 3.0 A.'
    }
  ],
  'P4.1.4': [
    {
      id: 'p4-1-4-q1',
      subject: 'physics',
      topicCode: 'P4',
      syllabusRef: 'P4.1.4',
      question: 'A 12 V battery is connected to a 4.0 Ω resistor. What current passes through the resistor?',
      options: [
        '3.0 A',
        '48 A',
        '0.33 A',
        '16 A'
      ],
      correctIndex: 0,
      explanation: 'Ohm’s law: I = V / R = 12 V / 4.0 Ω = 3.0 A.'
    }
  ],
  'P4.1.5': [
    {
      id: 'p4-1-5-q1',
      subject: 'physics',
      topicCode: 'P4',
      syllabusRef: 'P4.1.5',
      question: 'An electric kettle operates at 240 V and draws a current of 10 A. What is the electrical power rating of the kettle?',
      options: [
        '2400 W (2.4 kW)',
        '24 W',
        '250 W',
        '24,000 W'
      ],
      correctIndex: 0,
      explanation: 'Electrical power P = Voltage V × Current I = 240 V × 10 A = 2400 W.'
    }
  ],
  'P4.2.2': [
    {
      id: 'p4-2-2-q1',
      subject: 'physics',
      topicCode: 'P4',
      syllabusRef: 'P4.2.2',
      question: 'Two resistors of resistance 6.0 Ω and 3.0 Ω are connected in parallel. What is the combined total equivalent resistance of the pair?',
      options: [
        '2.0 Ω',
        '9.0 Ω',
        '18 Ω',
        '4.5 Ω'
      ],
      correctIndex: 0,
      explanation: 'In parallel: 1/Rtotal = 1/R1 + 1/R2 = 1/6 + 1/3 = 1/6 + 2/6 = 3/6 = 1/2. Therefore Rtotal = 2.0 Ω.'
    },
    {
      id: 'p4-2-2-q2',
      subject: 'physics',
      topicCode: 'P4',
      syllabusRef: 'P4.2.2',
      question: 'What is a major advantage of connecting domestic household lamps in parallel rather than in series?',
      options: [
        'Each lamp receives the full mains voltage and can be switched on or off independently without affecting the others',
        'Parallel circuits draw zero total current from the supply',
        'The total resistance of the household circuit becomes infinitely high',
        'If one bulb blows, all other bulbs receive increased voltage'
      ],
      correctIndex: 0,
      explanation: 'In parallel circuits, every branch experiences the full mains potential difference (240V). If one component fails, the circuit to other branches remains unbroken.'
    }
  ],
  'P4.3': [
    {
      id: 'p4-3-q1',
      subject: 'physics',
      topicCode: 'P4',
      syllabusRef: 'P4.3',
      question: 'An appliance has a metal outer casing. Which safety feature protects the user from electric shock if a loose live wire touches the metal casing?',
      options: [
        'The earth wire conducts large fault current safely to ground, causing the fuse to melt and break the circuit',
        'The neutral wire increases its electrical resistance',
        'The plastic casing melts to insulate the wire',
        'The live wire automatically reverses its polarity'
      ],
      correctIndex: 0,
      explanation: 'The metal casing is connected to the low-resistance earth wire. If live touches the case, a huge current flows to ground, quickly blowing the fuse and cutting power.'
    }
  ],

  // P5.1 - P5.2 Space Physics
  'P5.1.1': [
    {
      id: 'p5-1-1-q1',
      subject: 'physics',
      topicCode: 'P5',
      syllabusRef: 'P5.1.1',
      question: 'Which list places the four inner rocky planets of our Solar System in correct order of increasing distance from the Sun?',
      options: [
        'Mercury, Venus, Earth, Mars',
        'Venus, Mercury, Mars, Earth',
        'Mars, Earth, Venus, Mercury',
        'Mercury, Earth, Venus, Mars'
      ],
      correctIndex: 0,
      explanation: 'Inner rocky planets in order from the Sun: Mercury, Venus, Earth, Mars.'
    }
  ],
  'P5.2.1': [
    {
      id: 'p5-2-1-q1',
      subject: 'physics',
      topicCode: 'P5',
      syllabusRef: 'P5.2.1',
      tier: 'Core',
      question: 'What nuclear reaction powers the Sun and releases vast quantities of electromagnetic radiation?',
      options: [
        'Nuclear fusion of hydrogen nuclei into helium nuclei',
        'Nuclear fission of uranium-235 atoms',
        'Chemical combustion of methane and oxygen',
        'Radioactive alpha decay of radon gas'
      ],
      correctIndex: 0,
      explanation: 'The Sun produces energy in its core through nuclear fusion, where hydrogen nuclei fuse under extreme temperature and pressure to form helium, converting mass into energy (E=mc²).'
    }
  ],

  // P1.1 Measurement Techniques
  'P1.1': [
    {
      id: 'p1-1-phys-q1',
      subject: 'physics',
      topicCode: 'P1',
      syllabusRef: 'P1.1',
      tier: 'Core',
      question: 'A student measures the time taken for 20 complete oscillations of a simple pendulum and records 32.0 seconds. What is the period (time for one complete oscillation) of the pendulum?',
      options: [
        '1.60 s',
        '0.625 s',
        '12.0 s',
        '640 s'
      ],
      correctIndex: 0,
      explanation: 'Period T = total time / number of complete oscillations = 32.0 s / 20 = 1.60 s. Timing 20 oscillations reduces human reaction time percentage error.'
    },
    {
      id: 'p1-1-phys-q2',
      subject: 'physics',
      topicCode: 'P1',
      syllabusRef: 'P1.1',
      tier: 'Extended',
      question: 'Which instrument is most appropriate to determine the internal diameter of a small test-tube with 0.1 mm precision?',
      options: [
        'Vernier calipers',
        'Metre rule',
        'Measuring cylinder',
        'Spring balance'
      ],
      correctIndex: 0,
      explanation: 'Vernier calipers have dedicated inside jaws designed to measure internal diameters of tubes and cylinders to 0.1 mm precision.'
    }
  ],

  // P1.2 Motion
  'P1.2': [
    {
      id: 'p1-2-phys-q1',
      subject: 'physics',
      topicCode: 'P1',
      syllabusRef: 'P1.2',
      tier: 'Core',
      question: 'What physical quantity is represented by the gradient (slope) of a distance-time graph for a moving object?',
      options: [
        'Speed (or velocity)',
        'Acceleration',
        'Distance travelled',
        'Total mass'
      ],
      correctIndex: 0,
      explanation: 'On a distance-time graph, gradient = change in distance / change in time = speed.'
    },
    {
      id: 'p1-2-phys-q2',
      subject: 'physics',
      topicCode: 'P1',
      syllabusRef: 'P1.2',
      tier: 'Extended',
      question: 'A cyclist accelerates uniformly from rest to a velocity of 8.0 m/s in 4.0 seconds, travels at 8.0 m/s for 10 seconds, and decelerates uniformly to rest in 2.0 seconds. What is the total distance travelled?',
      options: [
        '104 m',
        '16 m',
        '80 m',
        '128 m'
      ],
      correctIndex: 0,
      explanation: 'Area under velocity-time graph = area of trapezium = ½ × (sum of parallel sides) × height = ½ × (16 s + 10 s) × 8.0 m/s = ½ × 26 × 8.0 = 104 m.'
    }
  ],

  // P1.3 Mass & Weight
  'P1.3': [
    {
      id: 'p1-3-phys-q1',
      subject: 'physics',
      topicCode: 'P1',
      syllabusRef: 'P1.3',
      tier: 'Core',
      question: 'An astronaut has a mass of 70 kg on Earth where g = 9.8 N/kg. The astronaut travels to the Moon where gravitational field strength g = 1.6 N/kg. What is the astronaut’s mass and weight on the Moon?',
      options: [
        'Mass = 70 kg, Weight = 112 N',
        'Mass = 11.4 kg, Weight = 112 N',
        'Mass = 70 kg, Weight = 686 N',
        'Mass = 43.75 kg, Weight = 70 N'
      ],
      correctIndex: 0,
      explanation: 'Mass is an intrinsic property that does not change with location: mass = 70 kg. Weight on Moon W = mg = 70 kg × 1.6 N/kg = 112 N.'
    }
  ],

  // P1.4 Density
  'P1.4': [
    {
      id: 'p1-4-phys-q1',
      subject: 'physics',
      topicCode: 'P1',
      syllabusRef: 'P1.4',
      tier: 'Core',
      question: 'A measuring cylinder contains 50 cm³ of water. When an irregular pebble of mass 65 g is completely submerged, the water level rises to 75 cm³. What is the density of the pebble?',
      options: [
        '2.6 g/cm³',
        '0.87 g/cm³',
        '1.3 g/cm³',
        '25 g/cm³'
      ],
      correctIndex: 0,
      explanation: 'Volume displaced by pebble = 75 cm³ – 50 cm³ = 25 cm³. Density ρ = mass / volume = 65 g / 25 cm³ = 2.6 g/cm³.'
    }
  ],

  // P1.6.3 Energy Resources
  'P1.6.3': [
    {
      id: 'p1-6-3-q1',
      subject: 'physics',
      topicCode: 'P1',
      syllabusRef: 'P1.6.3',
      tier: 'Core',
      question: 'Which energy resource does NOT derive its energy directly or indirectly from radiation emitted by the Sun?',
      options: [
        'Geothermal energy',
        'Wind power',
        'Hydroelectric power',
        'Fossil fuels (coal and petroleum)'
      ],
      correctIndex: 0,
      explanation: 'Geothermal energy originates from radioactive decay and residual heat deep within Earth’s core/mantle. Wind, hydro, and fossil fuels all derive from solar radiation.'
    }
  ],

  // P2.1.1 & P2.1.2 Gas Pressure & Molecular Model
  'P2.1.1': [
    {
      id: 'p2-1-1-q1',
      subject: 'physics',
      topicCode: 'P2',
      syllabusRef: 'P2.1.1',
      tier: 'Core',
      question: 'Why are liquids virtually incompressible compared to gases?',
      options: [
        'In liquids, particles are already in close contact with very little empty space between them',
        'Liquid particles possess zero kinetic energy',
        'Liquid particles expand to fill any container',
        'Liquids contain rigid covalent lattices'
      ],
      correctIndex: 0,
      explanation: 'In liquids, particles touch with negligible empty space between them, so repulsive forces resist compression. In gases, particles are separated by vast empty distances.'
    }
  ],
  'P2.1.2': [
    {
      id: 'p2-1-2-q1',
      subject: 'physics',
      topicCode: 'P2',
      syllabusRef: 'P2.1.2',
      tier: 'Extended',
      question: 'A sealed rigid container of gas is heated. Why does the pressure exerted by the gas on the container walls increase?',
      options: [
        'The gas particles gain kinetic energy, move faster, and collide with the walls more frequently and with greater force per collision',
        'The gas particles expand and become physically larger in volume',
        'The container walls contract due to thermal stress',
        'The number of gas molecules inside the container doubles'
      ],
      correctIndex: 0,
      explanation: 'Higher temperature increases average particle kinetic energy and speed. Particles strike the walls more frequently and with greater momentum change per collision, increasing the average outward force per unit area (pressure).'
    }
  ],

  // P2.2.1 Thermal Expansion
  'P2.2.1': [
    {
      id: 'p2-2-1-q1',
      subject: 'physics',
      topicCode: 'P2',
      syllabusRef: 'P2.2.1',
      tier: 'Core',
      question: 'A bimetallic strip made of brass and iron is heated. Brass expands more than iron for the same temperature rise. What happens to the strip?',
      options: [
        'It bends with the brass on the outside of the curve',
        'It bends with the iron on the outside of the curve',
        'It stays completely straight and expands in length only',
        'It snaps immediately at the joint'
      ],
      correctIndex: 0,
      explanation: 'Because brass expands more than iron, the brass layer becomes longer, forcing the strip into an arc with brass on the outer, longer side of the curve.'
    }
  ],

  // P2.3.2 Convection & P2.3.4 Insulation
  'P2.3.2': [
    {
      id: 'p2-3-2-q1',
      subject: 'physics',
      topicCode: 'P2',
      syllabusRef: 'P2.3.2',
      tier: 'Core',
      question: 'Why does warm fluid rise above cooler fluid in a convection current?',
      options: [
        'When fluid is heated, it expands, its volume increases, and its density decreases, causing it to float upwards',
        'Heated particles lose mass and become lighter',
        'Gravity only exerts downward force on cold particles',
        'Heat creates magnetic repulsion between molecules'
      ],
      correctIndex: 0,
      explanation: 'Heating increases particle spacing. Expanded warmer fluid is less dense than the surrounding cooler fluid, so it rises due to buoyant upthrust.'
    }
  ],
  'P2.3.4': [
    {
      id: 'p2-3-4-q1',
      subject: 'physics',
      topicCode: 'P2',
      syllabusRef: 'P2.3.4',
      tier: 'Extended',
      question: 'Which feature of a double-walled vacuum flask reduces heat transfer by thermal radiation?',
      options: [
        'Silvered shiny internal glass surfaces that reflect infrared radiation back into the liquid',
        'The vacuum space between the double glass walls',
        'The plastic screw stopper',
        'The shock-absorbing rubber support at the base'
      ],
      correctIndex: 0,
      explanation: 'Silvered shiny mirror surfaces are poor emitters and excellent reflectors of infrared radiation, minimizing radiative heat loss.'
    }
  ],

  // P3.2.3 Lenses & P3.2.4 Dispersion
  'P3.2.3': [
    {
      id: 'p3-2-3-q1',
      subject: 'physics',
      topicCode: 'P3',
      syllabusRef: 'P3.2.3',
      tier: 'Extended',
      question: 'An object is placed at a distance greater than twice the focal length (2F) from a thin converging (convex) lens. What are the characteristics of the image formed?',
      options: [
        'Real, inverted, and diminished (smaller than object)',
        'Virtual, upright, and magnified',
        'Real, upright, and same size',
        'Virtual, inverted, and magnified'
      ],
      correctIndex: 0,
      explanation: 'When object distance u > 2f for a converging lens, light rays refract through the lens to form a real, inverted, diminished image between F and 2F on the opposite side (as in a camera).'
    }
  ],
  'P3.2.4': [
    {
      id: 'p3-2-4-q1',
      subject: 'physics',
      topicCode: 'P3',
      syllabusRef: 'P3.2.4',
      tier: 'Core',
      question: 'When white light enters a triangular glass prism, it disperses into a visible spectrum of colours. Which colour is refracted the MOST upon entering and leaving the prism?',
      options: [
        'Violet',
        'Red',
        'Green',
        'Yellow'
      ],
      correctIndex: 0,
      explanation: 'Violet light has the shortest wavelength and highest frequency in the visible spectrum; it slows down the most in glass, experiencing the greatest refractive index and bending the most.'
    }
  ],

  // P4.1.1 & P4.1.3 Charge & EMF
  'P4.1.1': [
    {
      id: 'p4-1-1-q1',
      subject: 'physics',
      topicCode: 'P4',
      syllabusRef: 'P4.1.1',
      tier: 'Core',
      question: 'A polythene rod is rubbed with a dry woollen cloth and becomes negatively charged. How does the rod acquire this negative charge?',
      options: [
        'Electrons are transferred from the cloth onto the polythene rod by friction',
        'Protons are transferred from the polythene rod onto the cloth',
        'Positive ions are created inside the polythene rod',
        'Neutrons are rubbed off the surface of the rod'
      ],
      correctIndex: 0,
      explanation: 'Only negative electrons can move. Friction causes electrons to be transferred from cloth to polythene, leaving the polythene rod with an excess of electrons (negative charge).'
    }
  ],
  'P4.1.3': [
    {
      id: 'p4-1-3-q1',
      subject: 'physics',
      topicCode: 'P4',
      syllabusRef: 'P4.1.3',
      tier: 'Extended',
      question: 'How is the electromotive force (e.m.f.) of an electrical power source formally defined?',
      options: [
        'The electrical energy supplied by the source in driving unit charge around a complete circuit (V = W / Q)',
        'The rate of flow of electric charge per second through a resistor',
        'The opposition to electric current measured in ohms',
        'The magnetic force exerted on a current-carrying wire'
      ],
      correctIndex: 0,
      explanation: 'e.m.f. is the energy transferred from chemical (or other) forms to electrical energy per unit coulomb of charge that passes through the source: e.m.f. = Energy / Charge (Joules per Coulomb, or Volts).'
    }
  ],

  // P4.2.1 Circuit Components & Diagrams
  'P4.2.1': [
    {
      id: 'p4-2-1-q1',
      subject: 'physics',
      topicCode: 'P4',
      syllabusRef: 'P4.2.1',
      tier: 'Core',
      question: 'What happens to the electrical resistance of a negative-temperature-coefficient (NTC) thermistor when its temperature increases?',
      options: [
        'Its electrical resistance decreases significantly',
        'Its electrical resistance increases linearly',
        'Its electrical resistance remains completely constant',
        'Its resistance drops to negative ohms'
      ],
      correctIndex: 0,
      explanation: 'An NTC thermistor’s resistance drops as temperature rises, allowing more current to flow. Used in fire alarms and thermostat temperature sensors.'
    }
  ],

  // P4.4 Electromagnetic Effects & Transformers
  'P4.4': [
    {
      id: 'p4-4-q1',
      subject: 'physics',
      topicCode: 'P4',
      syllabusRef: 'P4.4',
      tier: 'Extended',
      question: 'A step-up transformer has 200 turns on its primary coil and 4000 turns on its secondary coil. If an alternating voltage of 12 V a.c. is applied to the primary coil, what is the output voltage from the secondary coil?',
      options: [
        '240 V a.c.',
        '0.60 V a.c.',
        '48 V a.c.',
        '2400 V a.c.'
      ],
      correctIndex: 0,
      explanation: 'Transformer equation: Vp / Vs = Np / Ns → Vs = (Ns / Np) × Vp = (4000 / 200) × 12 V = 20 × 12 V = 240 V a.c.'
    }
  ],

  // P5.2.2 & P5.2.3 Star Life Cycles & Expanding Universe
  'P5.2.2': [
    {
      id: 'p5-2-2-q1',
      subject: 'physics',
      topicCode: 'P5',
      syllabusRef: 'P5.2.2',
      tier: 'Extended',
      question: 'What is the final stable remnant stage in the life cycle of a star with a mass similar to the Sun after it has shed its outer planetary nebula?',
      options: [
        'White dwarf',
        'Black hole',
        'Neutron star',
        'Supernova'
      ],
      correctIndex: 0,
      explanation: 'A medium-mass star (like our Sun) expands into a red giant, expels its outer gas layers as a planetary nebula, leaving a dense, cooling white dwarf core.'
    }
  ],
  'P5.2.3': [
    {
      id: 'p5-2-3-q1',
      subject: 'physics',
      topicCode: 'P5',
      syllabusRef: 'P5.2.3',
      tier: 'Extended',
      question: 'How does cosmological redshift provide evidence that the Universe is expanding?',
      options: [
        'Light from distant galaxies is shifted toward longer (redder) wavelengths because the space through which the light travels is stretching',
        'Distant stars are cooling down and glowing red like embers',
        'Red light travels faster across interstellar space than blue light',
        'Atmospheric dust absorbs blue light, letting only red pass through'
      ],
      correctIndex: 0,
      explanation: 'Cosmological redshift occurs because the fabric of space is expanding. As light travels across expanding space, its wavelength is stretched toward the red end of the spectrum. Greater redshift from more distant galaxies indicates higher recession velocity (Hubble’s law).'
    }
  ]
};

