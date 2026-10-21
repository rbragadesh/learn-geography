// What each curriculum expects, and where GeoExplorer covers it. Shown in the parent area.
// Kept deliberately plain: boards revise books often, so this names topics rather than chapters.

export interface SyllabusRow {
  board: string;
  ages: string;
  reality: string;
  topics: string[];
}

export const SYLLABI: SyllabusRow[] = [
  {
    board: 'CBSE / NCERT (India)',
    ages: 'Class 1-2 (age 6-8)',
    reality:
      'No separate geography or EVS textbook in Classes 1-2 under NCF 2022 - "the world around us" is woven into language and maths. EVS proper starts in Class 3 (new NCERT book "Our Wondrous World"), and geography becomes a real strand in Class 6 Social Science ("Exploring Society: India and Beyond").',
    topics: [
      'Family, neighbourhood, directions and simple maps',
      'Water, air, weather and seasons',
      'Plants, animals and food from different regions of India',
      'Class 6 preview: locating places on Earth, oceans and continents, landforms',
    ],
  },
  {
    board: 'ICSE / CISCE (India)',
    ages: 'Class 1-2',
    reality:
      'EVS in the primary years, with books chosen by each school. Geography becomes a separate subject from Class 6 (globe, latitude/longitude, landforms, water bodies, minerals, agriculture, continents).',
    topics: ['Our surroundings and landforms', 'Directions and map reading', 'India: states, rivers, crops', 'Earth as a planet'],
  },
  {
    board: 'Singapore MOE Primary Social Studies',
    ages: 'P1-P2 (age 7-8)',
    reality:
      'P1-P2 sit in the cluster "Discovering Self and Immediate Environment": self, family, school, neighbourhood, and what unites people in Singapore. P3-P4 study Singapore past and present; P5-P6 move to Southeast Asia and the world.',
    topics: ['Places around me and simple maps', 'Singapore as an island city-state', 'Southeast Asian neighbours (preview of P5-P6)'],
  },
  {
    board: 'England National Curriculum (used by Cambridge/British international schools)',
    ages: 'Key Stage 1 (age 5-7) and Key Stage 2 (age 7-11)',
    reality:
      'The most explicit geography standard for this age. KS1: name and locate the 7 continents and 5 oceans; hot and cold areas relative to the Equator and Poles; weather and seasons; compass directions; geographical vocabulary (beach, cliff, mountain, valley, port, harbour...); maps, atlases, globes and map keys. KS2 adds world countries, latitude, longitude, hemispheres, tropics, time zones, climate zones, biomes, rivers, mountains, volcanoes, earthquakes, the water cycle and natural resources.',
    topics: ['Continents and oceans', 'Compass directions (4 then 8 points)', 'Landforms and water vocabulary', 'Equator, poles, hemispheres, tropics', 'Volcanoes, earthquakes, water cycle, biomes', 'Natural resources'],
  },
  {
    board: 'IB Primary Years Programme',
    ages: 'Age 3-12',
    reality:
      'No fixed content list. Geography appears through units such as "Where we are in place and time", "How the world works" and "Sharing the planet", so schools vary widely.',
    topics: ['Maps and place', 'Earth systems', 'People and resources'],
  },
  {
    board: 'US National Geography Standards',
    ages: 'K-12',
    reality:
      '18 standards under six essential elements: The World in Spatial Terms, Places and Regions, Physical Systems, Human Systems, Environment and Society, and The Uses of Geography.',
    topics: ['Maps and spatial thinking', 'Regions', 'Physical systems', 'Human systems and resources'],
  },
];

export const COMPETITIONS = [
  {
    name: 'Geo Genius (India)',
    fit: 'Open to Classes 2-10 from any board. The most realistic first competition target - Class 2 is next year.',
  },
  {
    name: 'International / US Geography Bee (iacompetitions.com)',
    fit: 'Has grade-based divisions, including one for the youngest children (3rd grade and under). Online qualifying exam, then regional rounds.',
  },
  {
    name: 'International Geography Olympiad (iGeo)',
    fit: 'For students aged 16-19. A long-term horizon, not a goal for this year.',
  },
];

// Where each zone of the app maps to curriculum strands.
export const COVERAGE: { zone: string; strands: string }[] = [
  { zone: '🧭 Map Skills', strands: 'Directions, map keys, globes, Equator/poles, hemispheres, latitude/longitude, time zones (KS1→KS2; CBSE Class 6 Ch. "Locating places on the Earth")' },
  { zone: '🇮🇳 India', strands: 'States, UTs and capitals; regions; neighbours; rivers, mountains, plateaus, desert; landmarks (CBSE/ICSE EVS + Class 6-9 India geography)' },
  { zone: '🌏 World', strands: 'Continents and oceans (KS1), countries, capitals and flags (KS2 / Geography Bee), landmarks' },
  { zone: '🌋 Our Earth', strands: 'Landforms and water bodies, weather and seasons, water cycle, layers of the Earth, volcanoes, earthquakes, biomes (KS1-KS2, CBSE Class 6-7)' },
  { zone: '🪐 Space', strands: 'Sun, Moon, planets, day/night, seasons, Indian space missions (CBSE Class 6 "Earth in the solar system", ICSE "Earth as a planet")' },
  { zone: '⛏️ Resources', strands: 'Natural resources, renewable vs non-renewable, India\'s crops and minerals, world resources (KS2 human geography, CBSE Class 8 resources)' },
  { zone: '🏆 Geo Champion', strands: 'Mixed, harder questions in the style of geography bees and Geo Genius' },
];
