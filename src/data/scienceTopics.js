export const scienceTopics = [
  {
    id: "planets",
    title: "The Planets",
    difficulty: "easy",
    icon: "🪐",
    image: "/images/planets.jpg",
    description: "Did you know there are 8 planets in our solar system?",
    items: ["Mercury", "Venus", "Earth", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune"],
    funFact: "Jupiter is the largest planet, and it could fit 1,300 Earths inside it!",
    color: "from-sky to-primary"
  },
  {
    id: "water-cycle",
    title: "The Water Cycle",
    difficulty: "easy",
    icon: "💧",
    image: "/images/water_cycle.jpg",
    description: "The water cycle has three main stages:",
    items: [
      { name: "Evaporation", detail: "Water turns into vapor and rises into the sky." },
      { name: "Condensation", detail: "Water vapor cools and forms clouds." },
      { name: "Precipitation", detail: "Water falls back to the ground as rain, snow, or hail." }
    ],
    funFact: "The water you drink today could have been part of a cloud thousands of years ago!",
    color: "from-secondary to-sky"
  },
  {
    id: "ocean-animals",
    title: "Animals of the Ocean",
    difficulty: "easy",
    icon: "🐋",
    image: "/images/Ocean_Animals.jpg",
    description: "The ocean is home to some amazing animals, including:",
    items: ["Whales", "Sharks", "Jellyfish", "Octopus", "Dolphins"],
    funFact: "Dolphins are known for their intelligence and communication skills!",
    color: "from-primary to-secondary"
  },
  {
    id: "volcanoes",
    title: "Volcanoes",
    difficulty: "medium",
    icon: "🌋",
    image: "/images/Volcanoes.jpg",
    description: "Volcanoes are openings in the Earth's crust where molten rock, gas, and ash erupt.",
    items: ["Magma Chamber", "Vent", "Crater", "Lava Flow"],
    funFact: "The world's largest volcano, Mauna Loa in Hawaii, is still active today!",
    color: "from-danger to-orange"
  },
  {
    id: "human-body",
    title: "The Human Body",
    difficulty: "medium",
    icon: "🧬",
    image: "/images/Human_Body.jpg",
    description: "The human body is a fascinating system made up of organs and tissues.",
    items: [
      { name: "Brain", detail: "Controls the body and its functions." },
      { name: "Heart", detail: "Pumps blood through the body." },
      { name: "Lungs", detail: "Help you breathe." },
      { name: "Stomach", detail: "Digests food." }
    ],
    funFact: "The average human heart beats over 100,000 times a day!",
    color: "from-pink to-primary"
  },
  {
    id: "photosynthesis",
    title: "Photosynthesis",
    difficulty: "medium",
    icon: "🌱",
    image: "/images/wise_owl.jpg",
    description: "How plants use sunlight, water, and carbon dioxide to create food.",
    items: [
      { name: "Sunlight", detail: "Provides energy for the process." },
      { name: "Chlorophyll", detail: "The green pigment that absorbs light." },
      { name: "Oxygen", detail: "Released as a byproduct." }
    ],
    funFact: "Without photosynthesis, there would be almost no oxygen in our atmosphere!",
    color: "from-green-500 to-emerald-400"
  },
  {
    id: "genetics",
    title: "Genetics & DNA",
    difficulty: "hard",
    icon: "🔬",
    image: "/images/kids.png",
    description: "The code of life that determines how living things grow and function.",
    items: [
      { name: "DNA", detail: "The molecule that carries genetic instructions." },
      { name: "Genes", detail: "Segments of DNA that determine traits." },
      { name: "Chromosomes", detail: "Structures that hold DNA in the cell nucleus." }
    ],
    funFact: "You share about 50% of your DNA with a banana!",
    color: "from-purple-500 to-indigo-500"
  },
  {
    id: "periodic-table",
    title: "The Periodic Table",
    difficulty: "hard",
    icon: "🧪",
    image: "/images/planets.jpg",
    description: "An organized chart of all the chemical elements in the universe.",
    items: [
      { name: "Protons", detail: "Determine the element's atomic number." },
      { name: "Groups", detail: "Columns showing elements with similar properties." },
      { name: "Periods", detail: "Rows indicating electron shell levels." }
    ],
    funFact: "The only letter not in the periodic table is the letter 'J'!",
    color: "from-cyan-500 to-blue-500"
  }
];

export const scienceQuestions = [
  // ============ EASY ============
  { id: 1, question: "What is the largest planet in our solar system?", options: ["Earth", "Jupiter", "Mars", "Saturn"], answer: "Jupiter", difficulty: "easy", topic: "planets" },
  { id: 2, question: "Which planet is known as the Red Planet?", options: ["Venus", "Mars", "Mercury", "Neptune"], answer: "Mars", difficulty: "easy", topic: "planets" },
  { id: 3, question: "What is the chemical symbol for water?", options: ["H2O", "O2", "CO2", "H2"], answer: "H2O", difficulty: "easy", topic: "chemistry" },
  { id: 4, question: "Which organ pumps blood through the human body?", options: ["Liver", "Heart", "Lungs", "Kidneys"], answer: "Heart", difficulty: "easy", topic: "human-body" },
  { id: 5, question: "What is the basic unit of life?", options: ["Atom", "Cell", "Molecule", "Organ"], answer: "Cell", difficulty: "easy", topic: "biology" },
  { id: 6, question: "How many legs does a spider have?", options: ["6", "8", "10", "4"], answer: "8", difficulty: "easy", topic: "animals" },
  { id: 7, question: "What do plants need to make food?", options: ["Darkness", "Sunlight", "Salt", "Sugar"], answer: "Sunlight", difficulty: "easy", topic: "biology" },
  { id: 8, question: "What is the boiling point of water?", options: ["90°C", "100°C", "110°C", "120°C"], answer: "100°C", difficulty: "easy", topic: "chemistry" },
  { id: 9, question: "Which animal is the largest mammal?", options: ["Elephant", "Blue Whale", "Giraffe", "Shark"], answer: "Blue Whale", difficulty: "easy", topic: "animals" },
  { id: 10, question: "What is the closest star to Earth?", options: ["Polaris", "Sirius", "The Sun", "Alpha Centauri"], answer: "The Sun", difficulty: "easy", topic: "space" },

  // ============ MEDIUM ============
  { id: 11, question: "What is the stage of the water cycle when clouds form?", options: ["Evaporation", "Condensation", "Precipitation", "Transpiration"], answer: "Condensation", difficulty: "medium", topic: "water-cycle" },
  { id: 12, question: "Which gas do plants primarily use for photosynthesis?", options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Hydrogen"], answer: "Carbon Dioxide", difficulty: "medium", topic: "biology" },
  { id: 13, question: "What force keeps planets in orbit around the Sun?", options: ["Magnetic Force", "Electromagnetic Force", "Gravity", "Nuclear Force"], answer: "Gravity", difficulty: "medium", topic: "physics" },
  { id: 14, question: "What is the primary source of energy for life on Earth?", options: ["The Moon", "The Sun", "The Earth", "The Stars"], answer: "The Sun", difficulty: "medium", topic: "space" },
  { id: 15, question: "What gas do humans breathe out?", options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Helium"], answer: "Carbon Dioxide", difficulty: "medium", topic: "biology" },
  { id: 16, question: "What is the hardest natural substance on Earth?", options: ["Gold", "Iron", "Diamond", "Quartz"], answer: "Diamond", difficulty: "medium", topic: "geology" },
  { id: 17, question: "How many bones does an adult human have?", options: ["186", "206", "226", "256"], answer: "206", difficulty: "medium", topic: "human-body" },
  { id: 18, question: "What layer of Earth's atmosphere do we live in?", options: ["Stratosphere", "Troposphere", "Mesosphere", "Thermosphere"], answer: "Troposphere", difficulty: "medium", topic: "geography" },
  { id: 19, question: "What planet has the most moons?", options: ["Jupiter", "Saturn", "Mars", "Neptune"], answer: "Saturn", difficulty: "medium", topic: "planets" },
  { id: 20, question: "What type of rock is formed from cooled lava?", options: ["Sedimentary", "Metamorphic", "Igneous", "Fossil"], answer: "Igneous", difficulty: "medium", topic: "geology" },

  // ============ HARD ============
  { id: 21, question: "What is the speed of light approximately?", options: ["300,000 km/s", "150,000 km/s", "500,000 km/s", "200,000 km/s"], answer: "300,000 km/s", difficulty: "hard", topic: "physics" },
  { id: 22, question: "What is the chemical formula for table salt?", options: ["NaCl", "KCl", "CaCl₂", "MgCl₂"], answer: "NaCl", difficulty: "hard", topic: "chemistry" },
  { id: 23, question: "Which element has the atomic number 1?", options: ["Helium", "Hydrogen", "Lithium", "Carbon"], answer: "Hydrogen", difficulty: "hard", topic: "chemistry" },
  { id: 24, question: "What is the largest organ of the human body?", options: ["Liver", "Brain", "Skin", "Heart"], answer: "Skin", difficulty: "hard", topic: "human-body" },
  { id: 25, question: "What planet rotates on its side?", options: ["Neptune", "Uranus", "Saturn", "Jupiter"], answer: "Uranus", difficulty: "hard", topic: "planets" },
  { id: 26, question: "What is the process by which cells divide?", options: ["Osmosis", "Mitosis", "Synthesis", "Photolysis"], answer: "Mitosis", difficulty: "hard", topic: "biology" },
  { id: 27, question: "What is the most abundant gas in Earth's atmosphere?", options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Argon"], answer: "Nitrogen", difficulty: "hard", topic: "chemistry" },
  { id: 28, question: "What is the pH of pure water?", options: ["5", "7", "9", "3"], answer: "7", difficulty: "hard", topic: "chemistry" },
  { id: 29, question: "What type of energy does the Sun primarily emit?", options: ["Kinetic", "Chemical", "Electromagnetic", "Nuclear"], answer: "Electromagnetic", difficulty: "hard", topic: "physics" },
  { id: 30, question: "How long does light from the Sun take to reach Earth?", options: ["2 minutes", "8 minutes", "15 minutes", "30 minutes"], answer: "8 minutes", difficulty: "hard", topic: "space" },
];
