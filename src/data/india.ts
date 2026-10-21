import type { Fact, IndiaRegion, LonLat, StateUT } from './types';

// 28 states + 8 union territories (as of 2026).
// Capital names follow current official usage, e.g. Port Blair was renamed Sri Vijaya Puram in 2024.
export const STATES: StateUT[] = [
  // ----- North -----
  {
    id: 'DL', name: 'Delhi', type: 'ut', capital: 'New Delhi', capitalLL: [77.21, 28.61], region: 'North',
    language: 'Hindi, English, Punjabi, Urdu', emoji: '🏛️',
    famousFor: ['Capital of India', 'Red Fort and Qutub Minar', 'India Gate'],
    funFact: 'New Delhi is the capital of all of India. The Parliament, where laws are made, is here.',
  },
  {
    id: 'UP', name: 'Uttar Pradesh', type: 'state', capital: 'Lucknow', capitalLL: [80.95, 26.85], region: 'North',
    language: 'Hindi', emoji: '🕌',
    famousFor: ['Taj Mahal in Agra', 'Most people of any state', 'Sugarcane and wheat'],
    funFact: 'More people live in Uttar Pradesh than in any other state. The Ganga and Yamuna rivers meet at Prayagraj.',
  },
  {
    id: 'PB', name: 'Punjab', type: 'state', capital: 'Chandigarh', capitalLL: [76.78, 30.73], region: 'North',
    language: 'Punjabi', emoji: '🌾',
    famousFor: ['Golden Temple in Amritsar', 'Wheat fields', 'Bhangra dance'],
    funFact: 'Punjab means "land of five rivers". Its farms grow so much wheat and rice that it is called the Granary of India.',
  },
  {
    id: 'HR', name: 'Haryana', type: 'state', capital: 'Chandigarh', capitalLL: [76.78, 30.73], region: 'North',
    language: 'Hindi', emoji: '🥛',
    famousFor: ['Kurukshetra', 'Milk and wheat', 'Great wrestlers and boxers'],
    funFact: 'Haryana and Punjab share the same capital city - Chandigarh!',
  },
  {
    id: 'CH', name: 'Chandigarh', type: 'ut', capital: 'Chandigarh', capitalLL: [76.78, 30.73], region: 'North',
    language: 'Hindi, Punjabi, English', emoji: '🪨',
    famousFor: ['Planned city', 'Rock Garden made from waste', 'Capital of Punjab and Haryana'],
    funFact: 'Chandigarh was carefully planned by the architect Le Corbusier. It is a capital for two states but belongs to neither!',
  },
  {
    id: 'JK', name: 'Jammu and Kashmir', type: 'ut', capital: 'Srinagar & Jammu', capitalLL: [74.8, 34.08], region: 'North',
    capitalNote: 'Srinagar is the summer capital and Jammu is the winter capital.',
    language: 'Kashmiri, Dogri, Urdu, Hindi', emoji: '🛶',
    famousFor: ['Dal Lake houseboats', 'Saffron', 'Apples and walnuts'],
    funFact: 'Kashmir is called "Paradise on Earth". The Chenab rail bridge here is the highest railway bridge in the world.',
  },
  {
    id: 'LA', name: 'Ladakh', type: 'ut', capital: 'Leh', capitalLL: [77.58, 34.15], region: 'North',
    capitalNote: 'Leh is the main capital; some offices are in Kargil too.',
    language: 'Ladakhi, Hindi, English', emoji: '🏔️',
    famousFor: ['Cold desert', 'Pangong Lake', 'Two-humped camels'],
    funFact: 'Ladakh is a cold desert high in the mountains. It became a union territory in 2019.',
  },
  {
    id: 'HP', name: 'Himachal Pradesh', type: 'state', capital: 'Shimla', capitalLL: [77.17, 31.1], region: 'North',
    capitalNote: 'Shimla is the capital; Dharamshala is the winter capital.',
    language: 'Hindi', emoji: '🍎',
    famousFor: ['Apples', 'Snowy mountains', 'Manali and Shimla'],
    funFact: 'Himachal means "snowy land". It grows lots of crunchy apples.',
  },
  {
    id: 'UK', name: 'Uttarakhand', type: 'state', capital: 'Dehradun', capitalLL: [78.03, 30.32], region: 'North',
    capitalNote: 'Dehradun is the winter capital; Gairsain is the summer capital.',
    language: 'Hindi', emoji: '🐅',
    famousFor: ['Where the Ganga and Yamuna begin', 'Jim Corbett National Park', 'Valley of Flowers'],
    funFact: 'The river Ganga starts from the Gangotri glacier in Uttarakhand. Jim Corbett was India\'s first national park.',
    sayCapital: 'Dehra Dun',
  },
  // ----- West -----
  {
    id: 'RJ', name: 'Rajasthan', type: 'state', capital: 'Jaipur', capitalLL: [75.79, 26.91], region: 'West',
    language: 'Hindi, Rajasthani', emoji: '🐪',
    famousFor: ['Thar Desert and camels', 'Forts and palaces', 'Marble'],
    funFact: 'Rajasthan is the biggest state of India by area. Jaipur is called the Pink City.',
  },
  {
    id: 'GJ', name: 'Gujarat', type: 'state', capital: 'Gandhinagar', capitalLL: [72.64, 23.22], region: 'West',
    language: 'Gujarati', emoji: '🦁',
    famousFor: ['Asiatic lions in Gir', 'Statue of Unity', 'Salt and cotton'],
    funFact: 'Gujarat has the longest coastline of any state. Gir forest is the only place in the world where Asiatic lions live in the wild.',
  },
  {
    id: 'MH', name: 'Maharashtra', type: 'state', capital: 'Mumbai', capitalLL: [72.88, 19.08], region: 'West',
    capitalNote: 'Mumbai is the capital; Nagpur is the second (winter) capital.',
    language: 'Marathi', emoji: '🎬',
    famousFor: ['Mumbai - city of films', 'Gateway of India', 'Ajanta and Ellora caves'],
    funFact: 'Mumbai is India\'s money capital and home of Bollywood films. Nagpur is famous for oranges.',
  },
  {
    id: 'GA', name: 'Goa', type: 'state', capital: 'Panaji', capitalLL: [73.83, 15.49], region: 'West',
    language: 'Konkani', emoji: '🏖️',
    famousFor: ['Beaches', 'Cashew nuts', 'Old Portuguese churches'],
    funFact: 'Goa is the smallest state of India by area. It was ruled by Portugal until 1961.',
  },
  {
    id: 'DD', name: 'Dadra and Nagar Haveli and Daman and Diu', type: 'ut', capital: 'Daman', capitalLL: [72.83, 20.42], region: 'West',
    language: 'Gujarati, Hindi', emoji: '🏰',
    famousFor: ['Diu Fort', 'Quiet beaches', 'Two places joined into one'],
    funFact: 'This union territory has the longest name in India! Two union territories were joined together in 2020.',
  },
  // ----- Central -----
  {
    id: 'MP', name: 'Madhya Pradesh', type: 'state', capital: 'Bhopal', capitalLL: [77.41, 23.26], region: 'Central',
    language: 'Hindi', emoji: '🐯',
    famousFor: ['Most tigers in India', 'Khajuraho and Sanchi', 'Diamonds from Panna'],
    funFact: 'Madhya Pradesh is called the Heart of India because it is right in the middle. It has more tigers than any other state.',
  },
  {
    id: 'CG', name: 'Chhattisgarh', type: 'state', capital: 'Raipur', capitalLL: [81.63, 21.25], region: 'Central',
    language: 'Hindi, Chhattisgarhi', emoji: '🌾',
    famousFor: ['Rice fields', 'Chitrakote waterfall', 'Coal and iron ore'],
    funFact: 'Chhattisgarh grows so much rice it is called the Rice Bowl of central India. Chitrakote Falls is called the Niagara of India.',
  },
  // ----- East -----
  {
    id: 'BR', name: 'Bihar', type: 'state', capital: 'Patna', capitalLL: [85.14, 25.59], region: 'East',
    language: 'Hindi, Maithili, Bhojpuri', emoji: '🧘',
    famousFor: ['Bodh Gaya, where Buddha became enlightened', 'Ancient Nalanda university', 'Litchis and makhana'],
    funFact: 'Long ago, Patna was called Pataliputra and was one of the biggest cities in the world.',
  },
  {
    id: 'JH', name: 'Jharkhand', type: 'state', capital: 'Ranchi', capitalLL: [85.33, 23.34], region: 'East',
    language: 'Hindi', emoji: '⛏️',
    famousFor: ['Coal and iron ore', 'Steel city Jamshedpur', 'Waterfalls'],
    funFact: 'Jharkhand means "land of forests". It is full of minerals like coal, iron ore and mica.',
  },
  {
    id: 'OD', name: 'Odisha', type: 'state', capital: 'Bhubaneswar', capitalLL: [85.82, 20.3], region: 'East',
    language: 'Odia', emoji: '☀️',
    famousFor: ['Konark Sun Temple', 'Jagannath Rath Yatra in Puri', 'Chilika Lake'],
    funFact: 'The Konark Sun Temple is built like a giant chariot with huge stone wheels. Odisha is rich in iron ore and bauxite.',
  },
  {
    id: 'WB', name: 'West Bengal', type: 'state', capital: 'Kolkata', capitalLL: [88.36, 22.57], region: 'East',
    language: 'Bengali', emoji: '🐯',
    famousFor: ['Sundarbans and Royal Bengal tigers', 'Darjeeling tea', 'Jute and rice'],
    funFact: 'The Sundarbans is the biggest mangrove forest in the world, home of the Royal Bengal tiger.',
  },
  // ----- Northeast -----
  {
    id: 'AS', name: 'Assam', type: 'state', capital: 'Dispur', capitalLL: [91.79, 26.14], region: 'Northeast',
    language: 'Assamese', emoji: '🦏',
    famousFor: ['Tea gardens', 'One-horned rhinos in Kaziranga', 'Mighty Brahmaputra river'],
    funFact: 'Assam grows more tea than any other state. Majuli in the Brahmaputra is one of the biggest river islands in the world.',
  },
  {
    id: 'AR', name: 'Arunachal Pradesh', type: 'state', capital: 'Itanagar', capitalLL: [93.61, 27.08], region: 'Northeast',
    language: 'English, Hindi, many tribal languages', emoji: '🌄',
    famousFor: ['Land of the Rising Sun', 'Tawang Monastery', 'Thick forests'],
    funFact: 'The Sun rises first in India here, in a village called Dong!',
  },
  {
    id: 'ML', name: 'Meghalaya', type: 'state', capital: 'Shillong', capitalLL: [91.89, 25.58], region: 'Northeast',
    language: 'Khasi, Garo, English', emoji: '🌧️',
    famousFor: ['One of the wettest places on Earth', 'Living root bridges', 'Caves'],
    funFact: 'Meghalaya means "home of the clouds". Mawsynram here is one of the rainiest places on Earth.',
  },
  {
    id: 'SK', name: 'Sikkim', type: 'state', capital: 'Gangtok', capitalLL: [88.61, 27.33], region: 'Northeast',
    language: 'Nepali, English', emoji: '🏔️',
    famousFor: ['Kangchenjunga mountain', 'First fully organic state', 'Large cardamom'],
    funFact: 'Kangchenjunga in Sikkim is the third-highest mountain in the world. All farming in Sikkim is organic.',
  },
  {
    id: 'NL', name: 'Nagaland', type: 'state', capital: 'Kohima', capitalLL: [94.11, 25.67], region: 'Northeast',
    language: 'English, Naga languages', emoji: '🪶',
    famousFor: ['Hornbill Festival', 'Many Naga tribes', 'Dzukou Valley'],
    funFact: 'Nagaland\'s Hornbill Festival in December celebrates the songs, dances and food of all its tribes.',
  },
  {
    id: 'MN', name: 'Manipur', type: 'state', capital: 'Imphal', capitalLL: [93.94, 24.82], region: 'Northeast',
    language: 'Manipuri (Meitei)', emoji: '🦌',
    famousFor: ['Loktak Lake with floating islands', 'Sangai deer', 'Polo'],
    funFact: 'Keibul Lamjao on Loktak Lake is the only floating national park in the world!',
  },
  {
    id: 'MZ', name: 'Mizoram', type: 'state', capital: 'Aizawl', capitalLL: [92.72, 23.73], region: 'Northeast',
    language: 'Mizo, English', emoji: '🎋',
    famousFor: ['Bamboo forests', 'Rolling hills', 'Cheraw bamboo dance'],
    funFact: 'Mizoram is covered with hills and bamboo. In the Cheraw dance, people hop between moving bamboo poles.',
    sayCapital: 'Eye-zawl',
  },
  {
    id: 'TR', name: 'Tripura', type: 'state', capital: 'Agartala', capitalLL: [91.28, 23.83], region: 'Northeast',
    language: 'Bengali, Kokborok', emoji: '🍍',
    famousFor: ['Ujjayanta Palace', 'Neermahal water palace', 'Pineapples and rubber'],
    funFact: 'Tripura is surrounded by Bangladesh on three sides.',
  },
  // ----- South -----
  {
    id: 'KA', name: 'Karnataka', type: 'state', capital: 'Bengaluru', capitalLL: [77.59, 12.97], region: 'South',
    language: 'Kannada', emoji: '☕',
    famousFor: ['Coffee from Coorg', 'Mysore Palace', 'Silk and sandalwood'],
    funFact: 'Karnataka grows most of India\'s coffee. Bengaluru is called the Silicon Valley of India because of its computer companies.',
  },
  {
    id: 'KL', name: 'Kerala', type: 'state', capital: 'Thiruvananthapuram', capitalLL: [76.94, 8.52], region: 'South',
    language: 'Malayalam', emoji: '🥥',
    famousFor: ['Backwaters and houseboats', 'Spices and coconuts', 'Kathakali dance'],
    funFact: 'Kerala is called God\'s Own Country. The monsoon rain reaches Kerala first, around the 1st of June.',
  },
  {
    id: 'TN', name: 'Tamil Nadu', type: 'state', capital: 'Chennai', capitalLL: [80.27, 13.08], region: 'South',
    language: 'Tamil', emoji: '🛕',
    famousFor: ['Meenakshi Temple in Madurai', 'Kanyakumari, the southern tip', 'Bharatanatyam dance'],
    funFact: 'At Kanyakumari, the southern tip of mainland India, three waters meet: the Arabian Sea, the Bay of Bengal and the Indian Ocean.',
  },
  {
    id: 'AP', name: 'Andhra Pradesh', type: 'state', capital: 'Amaravati', capitalLL: [80.52, 16.51], region: 'South',
    language: 'Telugu', emoji: '🌶️',
    famousFor: ['Tirupati temple', 'Spicy Guntur chillies', 'Kuchipudi dance'],
    funFact: 'The Kuchipudi dance is named after a village in Andhra Pradesh. Its new capital Amaravati is being built on the Krishna river.',
  },
  {
    id: 'TG', name: 'Telangana', type: 'state', capital: 'Hyderabad', capitalLL: [78.49, 17.39], region: 'South',
    language: 'Telugu, Urdu', emoji: '🕌',
    famousFor: ['Charminar', 'Hyderabadi biryani', 'Pearls'],
    funFact: 'Telangana is India\'s youngest state - it was made in 2014. Hyderabad is called the City of Pearls.',
  },
  {
    id: 'PY', name: 'Puducherry', type: 'ut', capital: 'Puducherry', capitalLL: [79.81, 11.94], region: 'South',
    language: 'Tamil, French, English', emoji: '🥖',
    famousFor: ['French-style streets', 'Auroville', 'Promenade beach'],
    funFact: 'Puducherry was ruled by France until 1954. Its four parts are spread across three different states!',
  },
  // ----- Islands -----
  {
    id: 'AN', name: 'Andaman and Nicobar Islands', type: 'ut', capital: 'Sri Vijaya Puram', capitalLL: [92.73, 11.62], region: 'Islands',
    capitalNote: 'It was called Port Blair until 2024.',
    language: 'Hindi, Bengali, English', emoji: '🏝️',
    famousFor: ['Coral reefs and beaches', 'Cellular Jail', 'Barren Island volcano'],
    funFact: 'Barren Island is India\'s only active volcano. Indira Point here is the southernmost point of India.',
  },
  {
    id: 'LD', name: 'Lakshadweep', type: 'ut', capital: 'Kavaratti', capitalLL: [72.64, 10.57], region: 'Islands',
    language: 'Malayalam', emoji: '🐠',
    famousFor: ['Coral islands', 'Blue lagoons', 'Coconuts and fishing'],
    funFact: 'Lakshadweep is the smallest union territory. Its islands are made of coral in the Arabian Sea.',
  },
];

export const STATE_BY_ID: Record<string, StateUT> = Object.fromEntries(STATES.map((s) => [s.id, s]));

export const REGIONS: { id: IndiaRegion; name: string; emoji: string; color: string }[] = [
  { id: 'North', name: 'North India', emoji: '🏔️', color: '#60a5fa' },
  { id: 'West', name: 'West India', emoji: '🐪', color: '#f59e0b' },
  { id: 'Central', name: 'Central India', emoji: '🐯', color: '#84cc16' },
  { id: 'East', name: 'East India', emoji: '☀️', color: '#f472b6' },
  { id: 'Northeast', name: 'Northeast India', emoji: '🦏', color: '#a78bfa' },
  { id: 'South', name: 'South India', emoji: '🥥', color: '#34d399' },
  { id: 'Islands', name: 'Islands', emoji: '🏝️', color: '#22d3ee' },
];

/** Small or thin places that need an enlarged tap target on the map. */
export const SMALL_STATES = ['DL', 'CH', 'GA', 'DD', 'PY', 'LD', 'SK', 'TR', 'AN', 'MZ', 'MN', 'NL', 'ML', 'HR', 'KL'];

// ----- Physical features of India -----
export interface PhysicalFeature {
  id: string;
  name: string;
  kind: 'river' | 'mountains' | 'desert' | 'plateau' | 'plain' | 'wetland' | 'sea';
  emoji: string;
  fact: string;
  /** Hand-placed ridge line (lon/lat) for mountain ranges; rivers and areas come from map data. */
  line?: LonLat[];
  /** Label position for seas and labels. */
  at?: LonLat;
}

export const INDIA_PHYSICAL: PhysicalFeature[] = [
  { id: 'ganga', name: 'Ganga', kind: 'river', emoji: '🌊', fact: 'The Ganga is the longest river in India. It starts at the Gangotri glacier and flows into the Bay of Bengal.' },
  { id: 'yamuna', name: 'Yamuna', kind: 'river', emoji: '🌊', fact: 'The Yamuna flows past Delhi and the Taj Mahal in Agra, then joins the Ganga at Prayagraj.' },
  { id: 'brahmaputra', name: 'Brahmaputra', kind: 'river', emoji: '🌊', fact: 'The Brahmaputra starts in Tibet and flows through Arunachal Pradesh and Assam. It is one of the biggest rivers in Asia.' },
  { id: 'godavari', name: 'Godavari', kind: 'river', emoji: '🌊', fact: 'The Godavari is the longest river of South India. People call it Dakshin Ganga - the Ganga of the South.' },
  { id: 'krishna', name: 'Krishna', kind: 'river', emoji: '🌊', fact: 'The Krishna starts in Maharashtra and flows east through Karnataka, Telangana and Andhra Pradesh.' },
  { id: 'kaveri', name: 'Kaveri', kind: 'river', emoji: '🌊', fact: 'The Kaveri starts in the hills of Karnataka and flows through Tamil Nadu into the Bay of Bengal.' },
  { id: 'narmada', name: 'Narmada', kind: 'river', emoji: '🌊', fact: 'The Narmada flows WEST into the Arabian Sea, between the Vindhya and Satpura hills. Most big Indian rivers flow east!' },
  { id: 'tapi', name: 'Tapi', kind: 'river', emoji: '🌊', fact: 'The Tapi also flows west into the Arabian Sea. The city of Surat is on the Tapi.' },
  { id: 'mahanadi', name: 'Mahanadi', kind: 'river', emoji: '🌊', fact: 'The Mahanadi flows through Chhattisgarh and Odisha. The Hirakud Dam is built on it.' },
  { id: 'indus', name: 'Indus', kind: 'river', emoji: '🌊', fact: 'The Indus flows through Ladakh. India got its name from this river - Sindhu.' },
  { id: 'himalayas', name: 'Himalayas', kind: 'mountains', emoji: '🏔️', fact: 'The Himalayas are the highest mountains in the world. They stand like a wall along India\'s north.',
    line: [[73.6, 35.4], [75, 34.2], [76.8, 33.1], [78.3, 31.6], [79.9, 30.4], [81.6, 29.4], [83.5, 28.6], [85.5, 28.1], [87.5, 27.9], [89.5, 27.9], [91.6, 27.9], [93.5, 28.2], [95.6, 28.7]] },
  { id: 'westernghats', name: 'Western Ghats', kind: 'mountains', emoji: '⛰️', fact: 'The Western Ghats run along the west coast. They catch the monsoon rain and are full of forests and wildlife.',
    line: [[73.6, 21.0], [73.6, 19.5], [73.7, 18.0], [73.9, 16.5], [74.3, 15.0], [74.8, 13.8], [75.6, 12.3], [76.5, 11.3], [77.0, 10.2], [77.2, 9.2], [77.4, 8.4]] },
  { id: 'easternghats', name: 'Eastern Ghats', kind: 'mountains', emoji: '⛰️', fact: 'The Eastern Ghats are older, lower hills along the east coast. Big rivers cut through them on the way to the sea.',
    line: [[86.0, 21.4], [84.5, 19.8], [83.2, 18.6], [81.9, 17.7], [80.6, 16.7], [79.4, 15.2], [79.0, 14.0], [78.6, 13.0], [77.9, 12.0]] },
  { id: 'aravalli', name: 'Aravalli Range', kind: 'mountains', emoji: '⛰️', fact: 'The Aravalli hills in Rajasthan are the oldest mountains in India. Mount Abu is here.',
    line: [[72.7, 24.5], [73.4, 25.1], [74.1, 25.7], [74.8, 26.4], [75.7, 27.2], [76.5, 27.9], [77.2, 28.5]] },
  { id: 'vindhya', name: 'Vindhya Range', kind: 'mountains', emoji: '⛰️', fact: 'The Vindhya hills cross the middle of India, just north of the Narmada river.',
    line: [[74.2, 23.3], [75.6, 23.5], [77.0, 23.8], [78.5, 24.1], [80.0, 24.4], [81.4, 24.7], [82.6, 24.8]] },
  { id: 'satpura', name: 'Satpura Range', kind: 'mountains', emoji: '⛰️', fact: 'The Satpura hills lie between the Narmada and Tapi rivers.',
    line: [[74.2, 21.6], [75.6, 21.6], [77.0, 21.8], [78.5, 22.1], [80.0, 22.4], [81.4, 22.6]] },
  { id: 'thar', name: 'Thar Desert', kind: 'desert', emoji: '🏜️', fact: 'The Thar is a big sandy desert in Rajasthan. Camels are called "ships of the desert".' },
  { id: 'deccan', name: 'Deccan Plateau', kind: 'plateau', emoji: '🟫', fact: 'The Deccan Plateau is a high, flat land that covers most of South India.' },
  { id: 'gangesplain', name: 'Ganga Plain', kind: 'plain', emoji: '🌾', fact: 'The Ganga Plain is flat, soft land made by rivers. It is one of the best farming lands on Earth.' },
  { id: 'sundarbans', name: 'Sundarbans', kind: 'wetland', emoji: '🐯', fact: 'The Sundarbans is the biggest mangrove forest in the world, where the Ganga and Brahmaputra meet the sea.' },
  { id: 'arabiansea', name: 'Arabian Sea', kind: 'sea', emoji: '🌊', at: [66.5, 16], fact: 'The Arabian Sea is to the WEST of India.' },
  { id: 'bayofbengal', name: 'Bay of Bengal', kind: 'sea', emoji: '🌊', at: [88, 15.5], fact: 'The Bay of Bengal is to the EAST of India. It is the biggest bay in the world.' },
  { id: 'indianocean', name: 'Indian Ocean', kind: 'sea', emoji: '🌊', at: [77.2, 7.0], fact: 'The Indian Ocean is to the SOUTH of India. It is the only ocean named after a country!' },
];

// ----- Landmarks of India -----
export interface Landmark {
  id: string;
  name: string;
  where: string; // state or country id
  emoji: string;
  fact: string;
}

export const INDIA_LANDMARKS: Landmark[] = [
  { id: 'tajmahal', name: 'Taj Mahal', where: 'UP', emoji: '🕌', fact: 'The Taj Mahal in Agra is made of white marble. It is one of the Seven Wonders of the modern world.' },
  { id: 'redfort', name: 'Red Fort', where: 'DL', emoji: '🏰', fact: 'Every Independence Day, the Prime Minister raises the flag at the Red Fort in Delhi.' },
  { id: 'qutubminar', name: 'Qutub Minar', where: 'DL', emoji: '🗼', fact: 'The Qutub Minar in Delhi is a tall tower of red sandstone, more than 800 years old.' },
  { id: 'gateway', name: 'Gateway of India', where: 'MH', emoji: '⛩️', fact: 'The Gateway of India is a huge arch by the sea in Mumbai.' },
  { id: 'ajanta', name: 'Ajanta and Ellora Caves', where: 'MH', emoji: '🪨', fact: 'At Ajanta and Ellora, people carved temples and paintings right into the rock long ago.' },
  { id: 'goldentemple', name: 'Golden Temple', where: 'PB', emoji: '✨', fact: 'The Golden Temple in Amritsar is covered in gold. Its kitchen serves free food to everyone, every day.' },
  { id: 'hawamahal', name: 'Hawa Mahal', where: 'RJ', emoji: '🏰', fact: 'The Hawa Mahal in Jaipur, the "Palace of Winds", has 953 little windows.' },
  { id: 'charminar', name: 'Charminar', where: 'TG', emoji: '🕌', fact: 'The Charminar in Hyderabad has four tall towers - "char minar" means four towers.' },
  { id: 'mysorepalace', name: 'Mysore Palace', where: 'KA', emoji: '🏰', fact: 'Mysore Palace glows with nearly 100,000 light bulbs during the Dasara festival.' },
  { id: 'konark', name: 'Konark Sun Temple', where: 'OD', emoji: '☀️', fact: 'Konark Sun Temple is shaped like the chariot of the Sun god, with 24 carved stone wheels.' },
  { id: 'victoria', name: 'Victoria Memorial', where: 'WB', emoji: '🏛️', fact: 'The Victoria Memorial is a big white marble building in Kolkata.' },
  { id: 'meenakshi', name: 'Meenakshi Temple', where: 'TN', emoji: '🛕', fact: 'The Meenakshi Temple in Madurai has tall gateway towers covered with colourful statues.' },
  { id: 'statueofunity', name: 'Statue of Unity', where: 'GJ', emoji: '🗿', fact: 'The Statue of Unity in Gujarat is the tallest statue in the world - 182 metres tall!' },
  { id: 'kaziranga', name: 'Kaziranga National Park', where: 'AS', emoji: '🦏', fact: 'Kaziranga is home to most of the world\'s one-horned rhinos.' },
  { id: 'gir', name: 'Gir National Park', where: 'GJ', emoji: '🦁', fact: 'Gir is the only place in the world where Asiatic lions live in the wild.' },
  { id: 'sanchi', name: 'Sanchi Stupa', where: 'MP', emoji: '🛕', fact: 'The Great Stupa at Sanchi is a dome built by Emperor Ashoka more than 2,000 years ago.' },
  { id: 'bodhgaya', name: 'Mahabodhi Temple, Bodh Gaya', where: 'BR', emoji: '🧘', fact: 'At Bodh Gaya, Prince Siddhartha sat under a tree and became the Buddha.' },
  { id: 'dallake', name: 'Dal Lake', where: 'JK', emoji: '🛶', fact: 'On Dal Lake in Srinagar, people live in houseboats and sell flowers from little boats called shikaras.' },
  { id: 'rootbridges', name: 'Living Root Bridges', where: 'ML', emoji: '🌳', fact: 'In Meghalaya, people guide tree roots across rivers to grow living bridges!' },
  { id: 'cellularjail', name: 'Cellular Jail', where: 'AN', emoji: '🏚️', fact: 'The Cellular Jail is where freedom fighters were imprisoned by the British.' },
  { id: 'basilica', name: 'Basilica of Bom Jesus', where: 'GA', emoji: '⛪', fact: 'The Basilica of Bom Jesus in Goa is more than 400 years old.' },
  { id: 'tawang', name: 'Tawang Monastery', where: 'AR', emoji: '🏯', fact: 'Tawang Monastery is the biggest monastery in India, high up in the mountains.' },
];

// ----- Resources and crops of India -----
export interface ResourceLink {
  id: string;
  resource: string;
  emoji: string;
  answer: string; // state id
  /** Other states also known for this - never used as wrong options. */
  alsoOk?: string[];
  fact: string;
}

export const INDIA_RESOURCES: ResourceLink[] = [
  { id: 'tea', resource: 'Tea', emoji: '🍵', answer: 'AS', alsoOk: ['WB', 'TN', 'KL'], fact: 'Assam grows more tea than any other state. Darjeeling tea from West Bengal is famous too.' },
  { id: 'coffee', resource: 'Coffee', emoji: '☕', answer: 'KA', alsoOk: ['KL', 'TN'], fact: 'Karnataka grows most of India\'s coffee, in hills like Coorg and Chikmagalur.' },
  { id: 'rubber', resource: 'Rubber', emoji: '🌳', answer: 'KL', alsoOk: ['TR'], fact: 'Kerala grows the most natural rubber. Rubber comes from the milky sap of rubber trees.' },
  { id: 'spices', resource: 'Spices like pepper and cardamom', emoji: '🌶️', answer: 'KL', alsoOk: ['KA', 'SK', 'AP'], fact: 'Kerala is called the Spice Garden of India. Traders came from far away to buy its black pepper.' },
  { id: 'apples', resource: 'Apples', emoji: '🍎', answer: 'HP', alsoOk: ['JK', 'UK'], fact: 'Jammu and Kashmir and Himachal Pradesh grow most of India\'s apples in cool mountain orchards. Himachal is often called the Apple State.' },
  { id: 'saffron', resource: 'Saffron', emoji: '🌸', answer: 'JK', fact: 'Saffron comes from crocus flowers grown in Kashmir. It is one of the most expensive spices in the world.' },
  { id: 'jute', resource: 'Jute (golden fibre)', emoji: '🧶', answer: 'WB', alsoOk: ['AS', 'BR'], fact: 'West Bengal grows the most jute. It is used to make sacks and bags, and is called the golden fibre.' },
  { id: 'makhana', resource: 'Makhana (fox nuts)', emoji: '🥜', answer: 'BR', fact: 'Almost all of India\'s makhana comes from the ponds of Bihar.' },
  { id: 'salt', resource: 'Salt', emoji: '🧂', answer: 'GJ', alsoOk: ['TN', 'RJ'], fact: 'Most of India\'s salt is made in Gujarat by drying sea water in the sun.' },
  { id: 'diamonds', resource: 'Diamonds', emoji: '💎', answer: 'MP', fact: 'Panna in Madhya Pradesh has India\'s only working diamond mine.' },
  { id: 'marble', resource: 'Marble', emoji: '🪨', answer: 'RJ', alsoOk: ['GJ', 'MP'], fact: 'The white marble of the Taj Mahal came from Makrana in Rajasthan.' },
  { id: 'coal', resource: 'Coal', emoji: '⚫', answer: 'JH', alsoOk: ['OD', 'CG', 'WB', 'MP', 'TG', 'MH', 'ML'], fact: 'Jharkhand, Odisha and Chhattisgarh have huge amounts of coal. Coal is burned to make electricity.' },
  { id: 'ironore', resource: 'Iron ore', emoji: '🔩', answer: 'OD', alsoOk: ['JH', 'CG', 'KA', 'GA'], fact: 'Odisha digs up the most iron ore. Iron is used to make steel for bridges and cars.' },
  { id: 'sugarcane', resource: 'Sugarcane', emoji: '🎋', answer: 'UP', alsoOk: ['MH', 'KA', 'TN', 'BR', 'GJ', 'AP', 'HR', 'PB'], fact: 'Uttar Pradesh grows the most sugarcane. Sugar and jaggery are made from it.' },
  { id: 'wheat', resource: 'Wheat', emoji: '🌾', answer: 'PB', alsoOk: ['UP', 'HR', 'MP', 'RJ', 'BR', 'GJ'], fact: 'Punjab and Haryana grow lots of wheat. Rotis are made from wheat flour!' },
  { id: 'soybean', resource: 'Soybean', emoji: '🫘', answer: 'MP', alsoOk: ['MH', 'RJ'], fact: 'Madhya Pradesh grows so much soybean that it is called the Soya State.' },
  { id: 'cotton', resource: 'Cotton', emoji: '☁️', answer: 'GJ', alsoOk: ['MH', 'TG', 'PB', 'HR', 'RJ', 'KA', 'AP', 'MP'], fact: 'Gujarat and Maharashtra grow lots of cotton, which is made into clothes.' },
  { id: 'oranges', resource: 'Oranges', emoji: '🍊', answer: 'MH', alsoOk: ['ML', 'AS', 'AR', 'MP', 'PB', 'SK', 'MZ', 'NL', 'MN', 'TR'], fact: 'Nagpur in Maharashtra is called the Orange City.' },
  { id: 'uranium', resource: 'Uranium', emoji: '⚛️', answer: 'JH', alsoOk: ['AP', 'ML', 'RJ', 'KA', 'TG'], fact: 'India\'s first uranium mine is at Jaduguda in Jharkhand. Uranium is used in nuclear power plants.' },
  { id: 'silk', resource: 'Silk', emoji: '🧵', answer: 'KA', alsoOk: ['AS', 'AP', 'TN', 'WB', 'JH'], fact: 'Karnataka makes the most silk - Mysore silk is famous. Silk is spun by silkworms!' },
  { id: 'oil', resource: 'Oil (petroleum)', emoji: '🛢️', answer: 'AS', alsoOk: ['RJ', 'GJ', 'MH', 'AR', 'TN', 'AP', 'NL'], fact: 'Digboi in Assam has one of the oldest oil refineries in the world. Oil is also found under the sea near Mumbai.' },
];

// ----- India: big facts and neighbours -----
export const INDIA_NEIGHBOURS = ['PAK', 'CHN', 'NPL', 'BTN', 'BGD', 'MMR', 'AFG'];
export const INDIA_SEA_NEIGHBOURS = ['LKA', 'MDV'];

export const INDIA_FACTS: Fact[] = [
  { id: 'inb1', level: 1, q: 'What is the capital of India?', a: 'New Delhi', wrong: ['Mumbai', 'Kolkata', 'Chennai'], explain: 'New Delhi is the capital of India.', emoji: '🇮🇳' },
  { id: 'inb2', level: 1, q: 'In which continent is India?', a: 'Asia', wrong: ['Europe', 'Africa', 'Australia'], explain: 'India is in Asia, the biggest continent.', emoji: '🌏' },
  { id: 'inb3', level: 1, q: 'Which sea is to the WEST of India?', a: 'Arabian Sea', wrong: ['Bay of Bengal', 'Red Sea', 'Black Sea'], explain: 'The Arabian Sea is to the west of India.', emoji: '🌊', map: { kind: 'india', ids: ['arabiansea'] } },
  { id: 'inb4', level: 1, q: 'Which bay is to the EAST of India?', a: 'Bay of Bengal', wrong: ['Arabian Sea', 'Bay of Biscay', 'Hudson Bay'], explain: 'The Bay of Bengal is to the east of India.', emoji: '🌊', map: { kind: 'india', ids: ['bayofbengal'] } },
  { id: 'inb5', level: 1, q: 'Which ocean is to the SOUTH of India?', a: 'Indian Ocean', wrong: ['Pacific Ocean', 'Atlantic Ocean', 'Arctic Ocean'], explain: 'The Indian Ocean is south of India - it is named after our country!', emoji: '🌊', map: { kind: 'india', ids: ['indianocean'] } },
  { id: 'inb6', level: 1, q: 'How many states does India have?', a: '28', wrong: ['8', '50', '36'], explain: 'India has 28 states and 8 union territories - 36 in all.', emoji: '🗺️' },
  { id: 'inb7', level: 1, q: 'Which mountains are in the north of India?', a: 'The Himalayas', wrong: ['The Alps', 'The Andes', 'The Rockies'], explain: 'The Himalayas, the highest mountains on Earth, are in the north of India.', emoji: '🏔️' },
  { id: 'inb8', level: 2, q: 'How many union territories does India have?', a: '8', wrong: ['28', '5', '12'], explain: 'India has 8 union territories. They are looked after by the central government.', emoji: '🗺️' },
  { id: 'inb9', level: 2, q: 'India is a peninsula. What does that mean?', a: 'Water on three sides', wrong: ['Water all around', 'No water nearby', 'Water on one side'], explain: 'A peninsula has water on three sides - the Arabian Sea, the Indian Ocean and the Bay of Bengal.', diagram: 'peninsula' },
  { id: 'inb10', level: 2, q: 'Which is the biggest state of India by area?', a: 'Rajasthan', wrong: ['Uttar Pradesh', 'Maharashtra', 'Goa'], explain: 'Rajasthan is the biggest state by area. Uttar Pradesh has the most people.', map: { kind: 'india', ids: ['RJ'] } },
  { id: 'inb11', level: 2, q: 'Which is the smallest state of India by area?', a: 'Goa', wrong: ['Sikkim', 'Kerala', 'Tripura'], explain: 'Goa is the smallest state by area.', map: { kind: 'india', ids: ['GA'] } },
  { id: 'inb12', level: 2, q: 'Which state has the most people?', a: 'Uttar Pradesh', wrong: ['Rajasthan', 'Kerala', 'Bihar'], explain: 'Uttar Pradesh has the most people of any Indian state.', map: { kind: 'india', ids: ['UP'] } },
  { id: 'inb13', level: 2, q: 'Which country has the most people in the world?', a: 'India', wrong: ['China', 'USA', 'Indonesia'], explain: 'Since 2023, India has more people than any other country - more than 140 crore!', emoji: '👨‍👩‍👧' },
  { id: 'inb14', level: 2, q: 'Which line of latitude passes through the middle of India?', a: 'Tropic of Cancer', wrong: ['Equator', 'Arctic Circle', 'Tropic of Capricorn'], explain: 'The Tropic of Cancer passes through 8 Indian states, from Gujarat to Mizoram.', diagram: 'latlong' },
  { id: 'inb15', level: 3, q: 'What is the southernmost point of India?', a: 'Indira Point', wrong: ['Kanyakumari', 'Rameswaram', 'Chennai'], explain: 'Indira Point in the Nicobar Islands is India\'s southernmost point. Kanyakumari is the tip of the mainland.', map: { kind: 'india', ids: ['AN'] } },
  { id: 'inb16', level: 3, q: 'Which strait separates India and Sri Lanka?', a: 'Palk Strait', wrong: ['Malacca Strait', 'Taiwan Strait', 'Strait of Hormuz'], explain: 'The narrow Palk Strait lies between Tamil Nadu and Sri Lanka.', diagram: 'strait' },
  { id: 'inb17', level: 3, q: 'Indian Standard Time is set by a line passing near which city?', a: 'Mirzapur (near Prayagraj)', wrong: ['Mumbai', 'Delhi', 'Kolkata'], explain: 'India\'s clocks follow the 82.5°E line of longitude, which passes near Mirzapur in Uttar Pradesh.' },
  { id: 'inb18', level: 3, q: 'Which state shares borders with the most other states?', a: 'Uttar Pradesh', wrong: ['Goa', 'Kerala', 'Gujarat'], explain: 'Uttar Pradesh touches 8 states and Delhi - more than any other state.', map: { kind: 'india', ids: ['UP'] } },
  { id: 'inb19', level: 2, q: 'Which neighbour of India has Mount Everest on its border?', a: 'Nepal', wrong: ['Sri Lanka', 'Bangladesh', 'Maldives'], explain: 'Mount Everest, the highest mountain on Earth, sits on the border of Nepal and China.', emoji: '🏔️' },
  { id: 'inb20', level: 2, q: 'Which group of states is called the "Seven Sisters"?', a: 'The Northeast states', wrong: ['The South Indian states', 'The desert states', 'The island territories'], explain: 'Assam, Arunachal Pradesh, Meghalaya, Nagaland, Manipur, Mizoram and Tripura are the Seven Sisters. Sikkim is their brother!', map: { kind: 'india', ids: ['AS', 'AR', 'ML', 'NL', 'MN', 'MZ', 'TR'] } },
];
