import type { Continent, Country } from './types';

// 193 UN member states + Vatican City and Palestine (UN observer states) + Taiwan.
// Taiwan is not a UN member, but it is included because it is a place this explorer has lived in.
type Row = [id: string, iso2: string, name: string, capital: string, tier: 1 | 2 | 3, fact?: string, extra?: Partial<Country>];

const ASIA: Row[] = [
  ['IND', 'IN', 'India', 'New Delhi', 1, 'India has the most people of any country and was named after the Indus river.'],
  ['SGP', 'SG', 'Singapore', 'Singapore', 1, 'Singapore is a city and a country at the same time! Tamil, English, Malay and Mandarin are all official languages.'],
  ['KOR', 'KR', 'South Korea', 'Seoul', 1, 'South Korea is on the Korean Peninsula. Its alphabet, Hangul, was invented by King Sejong.'],
  ['TWN', 'TW', 'Taiwan', 'Taipei', 1, 'Taiwan is a mountainous island, and the Tropic of Cancer crosses it. Bubble tea was invented there!', { capitalNote: 'Taiwan governs itself but is not a member of the United Nations.' }],
  ['IDN', 'ID', 'Indonesia', 'Jakarta', 1, 'Indonesia has more than 17,000 islands and about 130 active volcanoes. The Equator runs through it.', { capitalNote: 'Indonesia is building a new capital, Nusantara, on the island of Borneo.', transcontinental: true }],
  ['CHN', 'CN', 'China', 'Beijing', 1, 'The Great Wall of China is thousands of kilometres long. Pandas live in China\'s bamboo forests.'],
  ['JPN', 'JP', 'Japan', 'Tokyo', 1, 'Japan is a chain of islands. Mount Fuji is its tallest mountain and a volcano.'],
  ['PAK', 'PK', 'Pakistan', 'Islamabad', 1, 'Pakistan is India\'s neighbour to the west. The Indus river flows through it to the Arabian Sea.'],
  ['NPL', 'NP', 'Nepal', 'Kathmandu', 1, 'Nepal has 8 of the 10 highest mountains on Earth, including Mount Everest. Its flag is not a rectangle!'],
  ['BTN', 'BT', 'Bhutan', 'Thimphu', 1, 'Bhutan is a small Himalayan kingdom. It measures Gross National Happiness!'],
  ['BGD', 'BD', 'Bangladesh', 'Dhaka', 1, 'The Ganga and Brahmaputra rivers meet in Bangladesh to form the world\'s biggest delta.'],
  ['MMR', 'MM', 'Myanmar', 'Naypyidaw', 1, 'Myanmar is famous for golden pagodas like Shwedagon.'],
  ['LKA', 'LK', 'Sri Lanka', 'Sri Jayawardenepura Kotte', 1, 'Sri Lanka is an island south of India, famous for tea and elephants.', { capitalNote: 'Colombo is the biggest city; Sri Jayawardenepura Kotte is the official capital.' }],
  ['MDV', 'MV', 'Maldives', 'Malé', 1, 'The Maldives is made of about 1,200 coral islands. It is the flattest country on Earth.'],
  ['AFG', 'AF', 'Afghanistan', 'Kabul', 1, 'Afghanistan is a mountainous country with no coastline. The Hindu Kush mountains cross it.'],
  ['MYS', 'MY', 'Malaysia', 'Kuala Lumpur', 1, 'Malaysia is Singapore\'s neighbour. The Petronas Twin Towers are in Kuala Lumpur.', { capitalNote: 'Kuala Lumpur is the capital; many government offices are in Putrajaya.' }],
  ['THA', 'TH', 'Thailand', 'Bangkok', 1, 'Thailand grows lots of rice and rubber. Elephants are its national animal.'],
  ['SAU', 'SA', 'Saudi Arabia', 'Riyadh', 1, 'Saudi Arabia is mostly desert and has huge amounts of oil underground.'],
  ['ARE', 'AE', 'United Arab Emirates', 'Abu Dhabi', 1, 'The Burj Khalifa in Dubai is the tallest building in the world.'],
  ['VNM', 'VN', 'Vietnam', 'Hanoi', 2, 'Vietnam is long and thin like the letter S. Ha Long Bay has more than a thousand limestone islands.'],
  ['PHL', 'PH', 'Philippines', 'Manila', 2, 'The Philippines is made of more than 7,000 islands.'],
  ['KHM', 'KH', 'Cambodia', 'Phnom Penh', 2, 'Angkor Wat in Cambodia is the biggest religious monument in the world.'],
  ['LAO', 'LA', 'Laos', 'Vientiane', 2, 'Laos is the only Southeast Asian country with no coastline. The Mekong flows through it.'],
  ['MNG', 'MN', 'Mongolia', 'Ulaanbaatar', 2, 'Mongolia has the Gobi Desert. Many people live in round tents called gers.'],
  ['PRK', 'KP', 'North Korea', 'Pyongyang', 2, 'North Korea shares the Korean Peninsula with South Korea.'],
  ['IRN', 'IR', 'Iran', 'Tehran', 2, 'Iran was once called Persia, famous for Persian carpets.'],
  ['IRQ', 'IQ', 'Iraq', 'Baghdad', 2, 'The Tigris and Euphrates rivers flow through Iraq. One of the first cities on Earth grew here.'],
  ['TUR', 'TR', 'Türkiye (Turkey)', 'Ankara', 2, 'Türkiye is in both Asia and Europe. Istanbul is its biggest city, but not the capital.', { transcontinental: true }],
  ['QAT', 'QA', 'Qatar', 'Doha', 2, 'Qatar is a small desert country with lots of natural gas.'],
  ['OMN', 'OM', 'Oman', 'Muscat', 2, 'Oman is famous for frankincense, a sweet-smelling tree sap.'],
  ['KAZ', 'KZ', 'Kazakhstan', 'Astana', 2, 'Kazakhstan is the biggest country with no coastline.', { transcontinental: true }],
  ['UZB', 'UZ', 'Uzbekistan', 'Tashkent', 2, 'Samarkand in Uzbekistan was a great city on the old Silk Road.'],
  ['BRN', 'BN', 'Brunei', 'Bandar Seri Begawan', 2, 'Brunei is a small, rich country on the island of Borneo.'],
  ['TLS', 'TL', 'Timor-Leste', 'Dili', 2, 'Timor-Leste is one of the world\'s youngest countries (2002).'],
  ['ISR', 'IL', 'Israel', 'Jerusalem', 3, 'The Dead Sea, between Israel and Jordan, is so salty that people float in it.', { noCapitalQuiz: true, capitalNote: 'Israel names Jerusalem as its capital, but this is disputed; many embassies are in Tel Aviv.' }],
  ['PSE', 'PS', 'Palestine', 'Ramallah', 3, undefined, { noCapitalQuiz: true, capitalNote: 'Palestine claims East Jerusalem as its capital; its government works from Ramallah.' }],
  ['ARM', 'AM', 'Armenia', 'Yerevan', 3, undefined, { transcontinental: true }],
  ['AZE', 'AZ', 'Azerbaijan', 'Baku', 3, undefined, { transcontinental: true }],
  ['GEO', 'GE', 'Georgia', 'Tbilisi', 3, undefined, { transcontinental: true }],
  ['CYP', 'CY', 'Cyprus', 'Nicosia', 3, undefined, { transcontinental: true }],
  ['BHR', 'BH', 'Bahrain', 'Manama', 3],
  ['JOR', 'JO', 'Jordan', 'Amman', 3, 'Petra in Jordan is a city carved into pink rock.'],
  ['KWT', 'KW', 'Kuwait', 'Kuwait City', 3],
  ['KGZ', 'KG', 'Kyrgyzstan', 'Bishkek', 3],
  ['LBN', 'LB', 'Lebanon', 'Beirut', 3],
  ['SYR', 'SY', 'Syria', 'Damascus', 3],
  ['TJK', 'TJ', 'Tajikistan', 'Dushanbe', 3],
  ['TKM', 'TM', 'Turkmenistan', 'Ashgabat', 3],
  ['YEM', 'YE', 'Yemen', 'Sana\'a', 3],
];

const EUROPE: Row[] = [
  ['GBR', 'GB', 'United Kingdom', 'London', 1, 'The UK is made of England, Scotland, Wales and Northern Ireland. Big Ben is in London.'],
  ['FRA', 'FR', 'France', 'Paris', 1, 'The Eiffel Tower is in Paris. France is famous for its cheese and bread.'],
  ['DEU', 'DE', 'Germany', 'Berlin', 1, 'Germany is famous for cars and fairy-tale castles like Neuschwanstein.'],
  ['ITA', 'IT', 'Italy', 'Rome', 1, 'Italy is shaped like a boot! Pizza and pasta come from Italy.'],
  ['RUS', 'RU', 'Russia', 'Moscow', 1, 'Russia is the biggest country in the world. It is in both Europe and Asia and has 11 time zones.', { transcontinental: true }],
  ['ESP', 'ES', 'Spain', 'Madrid', 2, 'Spain makes the most olive oil in the world.'],
  ['PRT', 'PT', 'Portugal', 'Lisbon', 2, 'Portuguese sailors like Vasco da Gama sailed all the way to India in 1498.'],
  ['NLD', 'NL', 'Netherlands', 'Amsterdam', 2, 'The Netherlands is famous for tulips, windmills and bicycles. Much of it is below sea level!', { capitalNote: 'Amsterdam is the capital; the government sits in The Hague.' }],
  ['BEL', 'BE', 'Belgium', 'Brussels', 2, 'Belgium is famous for chocolate and waffles.'],
  ['CHE', 'CH', 'Switzerland', 'Bern', 2, 'Switzerland is in the Alps and is famous for chocolate, cheese and watches.'],
  ['AUT', 'AT', 'Austria', 'Vienna', 2, 'Mozart, the famous music composer, was born in Austria.'],
  ['GRC', 'GR', 'Greece', 'Athens', 2, 'The Olympic Games started in ancient Greece.'],
  ['SWE', 'SE', 'Sweden', 'Stockholm', 2, 'Sweden has many thousands of islands and lakes.'],
  ['NOR', 'NO', 'Norway', 'Oslo', 2, 'Norway has deep sea inlets called fjords. In summer, the Sun barely sets in the far north.'],
  ['FIN', 'FI', 'Finland', 'Helsinki', 2, 'Finland is called the land of a thousand lakes - it really has many more!'],
  ['DNK', 'DK', 'Denmark', 'Copenhagen', 2, 'LEGO bricks were invented in Denmark.'],
  ['POL', 'PL', 'Poland', 'Warsaw', 2, 'Marie Curie, who won two Nobel Prizes, was born in Poland.'],
  ['UKR', 'UA', 'Ukraine', 'Kyiv', 2, 'Ukraine has rich black soil and grows lots of wheat and sunflowers.'],
  ['IRL', 'IE', 'Ireland', 'Dublin', 2, 'Ireland is called the Emerald Isle because it is so green.'],
  ['ISL', 'IS', 'Iceland', 'Reykjavík', 2, 'Iceland has volcanoes, glaciers and hot springs called geysers.'],
  ['VAT', 'VA', 'Vatican City', 'Vatican City', 2, 'Vatican City is the smallest country in the world - it fits inside the city of Rome!'],
  ['ALB', 'AL', 'Albania', 'Tirana', 3],
  ['AND', 'AD', 'Andorra', 'Andorra la Vella', 3],
  ['BLR', 'BY', 'Belarus', 'Minsk', 3],
  ['BIH', 'BA', 'Bosnia and Herzegovina', 'Sarajevo', 3],
  ['BGR', 'BG', 'Bulgaria', 'Sofia', 3],
  ['HRV', 'HR', 'Croatia', 'Zagreb', 3],
  ['CZE', 'CZ', 'Czechia', 'Prague', 3],
  ['EST', 'EE', 'Estonia', 'Tallinn', 3],
  ['HUN', 'HU', 'Hungary', 'Budapest', 3],
  ['LVA', 'LV', 'Latvia', 'Riga', 3],
  ['LIE', 'LI', 'Liechtenstein', 'Vaduz', 3],
  ['LTU', 'LT', 'Lithuania', 'Vilnius', 3],
  ['LUX', 'LU', 'Luxembourg', 'Luxembourg', 3],
  ['MLT', 'MT', 'Malta', 'Valletta', 3],
  ['MDA', 'MD', 'Moldova', 'Chișinău', 3],
  ['MCO', 'MC', 'Monaco', 'Monaco', 3],
  ['MNE', 'ME', 'Montenegro', 'Podgorica', 3],
  ['MKD', 'MK', 'North Macedonia', 'Skopje', 3],
  ['ROU', 'RO', 'Romania', 'Bucharest', 3],
  ['SMR', 'SM', 'San Marino', 'San Marino', 3],
  ['SRB', 'RS', 'Serbia', 'Belgrade', 3],
  ['SVK', 'SK', 'Slovakia', 'Bratislava', 3],
  ['SVN', 'SI', 'Slovenia', 'Ljubljana', 3],
];

const AFRICA: Row[] = [
  ['EGY', 'EG', 'Egypt', 'Cairo', 1, 'The Pyramids of Giza were built more than 4,500 years ago. The Nile flows through Egypt.', { transcontinental: true }],
  ['ZAF', 'ZA', 'South Africa', 'Pretoria', 1, 'South Africa has three capital cities! Table Mountain is in Cape Town.', { capitalNote: 'Pretoria (government), Cape Town (parliament) and Bloemfontein (courts) are all capitals.' }],
  ['KEN', 'KE', 'Kenya', 'Nairobi', 1, 'Kenya is famous for safaris with lions, zebras and giraffes. The Equator crosses it.'],
  ['NGA', 'NG', 'Nigeria', 'Abuja', 2, 'Nigeria has the most people of any African country.'],
  ['ETH', 'ET', 'Ethiopia', 'Addis Ababa', 2, 'Coffee was first discovered in Ethiopia.'],
  ['MAR', 'MA', 'Morocco', 'Rabat', 2, 'Morocco has the Atlas Mountains and the edge of the Sahara Desert.'],
  ['TZA', 'TZ', 'Tanzania', 'Dodoma', 2, 'Mount Kilimanjaro, the highest mountain in Africa, is in Tanzania.'],
  ['GHA', 'GH', 'Ghana', 'Accra', 2, 'Ghana grows lots of cocoa, used to make chocolate.'],
  ['DZA', 'DZ', 'Algeria', 'Algiers', 2, 'Algeria is the biggest country in Africa. Most of it is the Sahara Desert.'],
  ['MDG', 'MG', 'Madagascar', 'Antananarivo', 2, 'Madagascar is a huge island where lemurs live - they are found nowhere else!'],
  ['CIV', 'CI', 'Côte d\'Ivoire', 'Yamoussoukro', 2, 'Côte d\'Ivoire (Ivory Coast) grows the most cocoa in the world.', { capitalNote: 'Abidjan is the biggest city.' }],
  ['COD', 'CD', 'DR Congo', 'Kinshasa', 2, 'The Congo rainforest is the second-biggest rainforest on Earth.'],
  ['AGO', 'AO', 'Angola', 'Luanda', 3],
  ['BEN', 'BJ', 'Benin', 'Porto-Novo', 3, undefined, { capitalNote: 'Cotonou is the seat of government.' }],
  ['BWA', 'BW', 'Botswana', 'Gaborone', 3, 'Botswana is famous for diamonds and the Okavango Delta.'],
  ['BFA', 'BF', 'Burkina Faso', 'Ouagadougou', 3],
  ['BDI', 'BI', 'Burundi', 'Gitega', 3],
  ['CPV', 'CV', 'Cabo Verde', 'Praia', 3],
  ['CMR', 'CM', 'Cameroon', 'Yaoundé', 3],
  ['CAF', 'CF', 'Central African Republic', 'Bangui', 3],
  ['TCD', 'TD', 'Chad', 'N\'Djamena', 3],
  ['COM', 'KM', 'Comoros', 'Moroni', 3],
  ['COG', 'CG', 'Republic of the Congo', 'Brazzaville', 3],
  ['DJI', 'DJ', 'Djibouti', 'Djibouti', 3],
  ['GNQ', 'GQ', 'Equatorial Guinea', 'Malabo', 3],
  ['ERI', 'ER', 'Eritrea', 'Asmara', 3],
  ['SWZ', 'SZ', 'Eswatini', 'Mbabane', 3],
  ['GAB', 'GA', 'Gabon', 'Libreville', 3],
  ['GMB', 'GM', 'Gambia', 'Banjul', 3],
  ['GIN', 'GN', 'Guinea', 'Conakry', 3],
  ['GNB', 'GW', 'Guinea-Bissau', 'Bissau', 3],
  ['LSO', 'LS', 'Lesotho', 'Maseru', 3],
  ['LBR', 'LR', 'Liberia', 'Monrovia', 3],
  ['LBY', 'LY', 'Libya', 'Tripoli', 3],
  ['MWI', 'MW', 'Malawi', 'Lilongwe', 3],
  ['MLI', 'ML', 'Mali', 'Bamako', 3],
  ['MRT', 'MR', 'Mauritania', 'Nouakchott', 3],
  ['MUS', 'MU', 'Mauritius', 'Port Louis', 3],
  ['MOZ', 'MZ', 'Mozambique', 'Maputo', 3],
  ['NAM', 'NA', 'Namibia', 'Windhoek', 3],
  ['NER', 'NE', 'Niger', 'Niamey', 3],
  ['RWA', 'RW', 'Rwanda', 'Kigali', 3],
  ['STP', 'ST', 'São Tomé and Príncipe', 'São Tomé', 3],
  ['SEN', 'SN', 'Senegal', 'Dakar', 3],
  ['SYC', 'SC', 'Seychelles', 'Victoria', 3],
  ['SLE', 'SL', 'Sierra Leone', 'Freetown', 3],
  ['SOM', 'SO', 'Somalia', 'Mogadishu', 3],
  ['SSD', 'SS', 'South Sudan', 'Juba', 3, 'South Sudan is the world\'s newest country (2011).'],
  ['SDN', 'SD', 'Sudan', 'Khartoum', 3],
  ['TGO', 'TG', 'Togo', 'Lomé', 3],
  ['TUN', 'TN', 'Tunisia', 'Tunis', 3],
  ['UGA', 'UG', 'Uganda', 'Kampala', 3],
  ['ZMB', 'ZM', 'Zambia', 'Lusaka', 3],
  ['ZWE', 'ZW', 'Zimbabwe', 'Harare', 3],
];

const NORTH_AMERICA: Row[] = [
  ['USA', 'US', 'United States', 'Washington, D.C.', 1, 'The USA has 50 states. The Statue of Liberty is in New York.'],
  ['CAN', 'CA', 'Canada', 'Ottawa', 1, 'Canada is the second-biggest country in the world and makes most of the world\'s maple syrup.'],
  ['MEX', 'MX', 'Mexico', 'Mexico City', 1, 'Corn and chillies were first grown in Mexico. The ancient Aztecs made chocolate drinks!'],
  ['CUB', 'CU', 'Cuba', 'Havana', 2, 'Cuba is the biggest island in the Caribbean Sea.'],
  ['JAM', 'JM', 'Jamaica', 'Kingston', 2, 'Jamaica is the home of super-fast runner Usain Bolt.'],
  ['PAN', 'PA', 'Panama', 'Panama City', 2, 'The Panama Canal lets ships cross between the Atlantic and Pacific Oceans.'],
  ['ATG', 'AG', 'Antigua and Barbuda', 'St. John\'s', 3],
  ['BHS', 'BS', 'Bahamas', 'Nassau', 3],
  ['BRB', 'BB', 'Barbados', 'Bridgetown', 3],
  ['BLZ', 'BZ', 'Belize', 'Belmopan', 3],
  ['CRI', 'CR', 'Costa Rica', 'San José', 3],
  ['DMA', 'DM', 'Dominica', 'Roseau', 3],
  ['DOM', 'DO', 'Dominican Republic', 'Santo Domingo', 3],
  ['SLV', 'SV', 'El Salvador', 'San Salvador', 3],
  ['GRD', 'GD', 'Grenada', 'St. George\'s', 3],
  ['GTM', 'GT', 'Guatemala', 'Guatemala City', 3],
  ['HTI', 'HT', 'Haiti', 'Port-au-Prince', 3],
  ['HND', 'HN', 'Honduras', 'Tegucigalpa', 3],
  ['NIC', 'NI', 'Nicaragua', 'Managua', 3],
  ['KNA', 'KN', 'Saint Kitts and Nevis', 'Basseterre', 3],
  ['LCA', 'LC', 'Saint Lucia', 'Castries', 3],
  ['VCT', 'VC', 'Saint Vincent and the Grenadines', 'Kingstown', 3],
  ['TTO', 'TT', 'Trinidad and Tobago', 'Port of Spain', 3],
];

const SOUTH_AMERICA: Row[] = [
  ['BRA', 'BR', 'Brazil', 'Brasília', 1, 'Brazil has most of the Amazon rainforest and grows the most coffee in the world.'],
  ['ARG', 'AR', 'Argentina', 'Buenos Aires', 2, 'Argentina has grassy plains called the Pampas and the icy land of Patagonia.'],
  ['CHL', 'CL', 'Chile', 'Santiago', 2, 'Chile is very long and thin. The Atacama Desert there is one of the driest places on Earth.'],
  ['PER', 'PE', 'Peru', 'Lima', 2, 'Machu Picchu, an ancient city in the mountains, is in Peru. Potatoes were first grown here.'],
  ['COL', 'CO', 'Colombia', 'Bogotá', 2, 'Colombia is famous for coffee and has coasts on two oceans.'],
  ['VEN', 'VE', 'Venezuela', 'Caracas', 2, 'Angel Falls in Venezuela is the highest waterfall in the world.'],
  ['BOL', 'BO', 'Bolivia', 'Sucre', 3, 'Bolivia has the world\'s largest salt flat, Salar de Uyuni.', { capitalNote: 'Sucre is the official capital; the government sits in La Paz.' }],
  ['ECU', 'EC', 'Ecuador', 'Quito', 3, 'Ecuador is named after the Equator, which crosses it. The Galápagos Islands belong to it.'],
  ['GUY', 'GY', 'Guyana', 'Georgetown', 3],
  ['PRY', 'PY', 'Paraguay', 'Asunción', 3],
  ['SUR', 'SR', 'Suriname', 'Paramaribo', 3],
  ['URY', 'UY', 'Uruguay', 'Montevideo', 3],
];

const OCEANIA: Row[] = [
  ['AUS', 'AU', 'Australia', 'Canberra', 1, 'Australia is a country AND a continent. Kangaroos and koalas live there.'],
  ['NZL', 'NZ', 'New Zealand', 'Wellington', 2, 'New Zealand has two main islands. The kiwi bird lives only there.'],
  ['FJI', 'FJ', 'Fiji', 'Suva', 2, 'Fiji is a group of more than 300 islands in the Pacific Ocean.'],
  ['PNG', 'PG', 'Papua New Guinea', 'Port Moresby', 2, 'Papua New Guinea has more than 800 languages - more than any other country!'],
  ['KIR', 'KI', 'Kiribati', 'Tarawa', 3],
  ['MHL', 'MH', 'Marshall Islands', 'Majuro', 3],
  ['FSM', 'FM', 'Micronesia', 'Palikir', 3],
  ['NRU', 'NR', 'Nauru', 'Yaren', 3, undefined, { noCapitalQuiz: true, capitalNote: 'Nauru has no official capital; the government is in Yaren.' }],
  ['PLW', 'PW', 'Palau', 'Ngerulmud', 3],
  ['WSM', 'WS', 'Samoa', 'Apia', 3],
  ['SLB', 'SB', 'Solomon Islands', 'Honiara', 3],
  ['TON', 'TO', 'Tonga', 'Nukuʻalofa', 3],
  ['TUV', 'TV', 'Tuvalu', 'Funafuti', 3],
  ['VUT', 'VU', 'Vanuatu', 'Port Vila', 3],
];

function build(rows: Row[], continent: Continent): Country[] {
  return rows.map(([id, iso2, name, capital, tier, fact, extra]) => ({ id, iso2, name, capital, tier, fact, continent, ...extra }));
}

export const COUNTRIES: Country[] = [
  ...build(ASIA, 'Asia'),
  ...build(EUROPE, 'Europe'),
  ...build(AFRICA, 'Africa'),
  ...build(NORTH_AMERICA, 'North America'),
  ...build(SOUTH_AMERICA, 'South America'),
  ...build(OCEANIA, 'Oceania'),
];

export const COUNTRY_BY_ID: Record<string, Country> = Object.fromEntries(COUNTRIES.map((c) => [c.id, c]));

/** Countries this explorer has lived in or visited (editable in the parent area). */
export const DEFAULT_PASSPORT = ['IND', 'SGP', 'KOR', 'TWN', 'IDN'];

export function flagOf(iso2: string): string {
  return iso2
    .toUpperCase()
    .split('')
    .map((ch) => String.fromCodePoint(0x1f1e6 + ch.charCodeAt(0) - 65))
    .join('');
}

export const CONTINENTS: { id: Continent | 'Antarctica'; emoji: string; color: string; fact: string; countries: string }[] = [
  { id: 'Asia', emoji: '🐼', color: '#facc15', fact: 'Asia is the biggest continent and has the most people. India, China and Japan are in Asia.', countries: '48' },
  { id: 'Africa', emoji: '🦁', color: '#f472b6', fact: 'Africa has the most countries - 54! The Sahara, the biggest hot desert, is here.', countries: '54' },
  { id: 'North America', emoji: '🦅', color: '#4ade80', fact: 'North America has Canada, the USA and Mexico, and the islands of the Caribbean.', countries: '23' },
  { id: 'South America', emoji: '🦜', color: '#fb923c', fact: 'South America has the Amazon rainforest and the long Andes mountains.', countries: '12' },
  { id: 'Antarctica', emoji: '🐧', color: '#cbd5e1', fact: 'Antarctica is the coldest place on Earth. Penguins live there, but no people live there all the time.', countries: '0' },
  { id: 'Europe', emoji: '🏰', color: '#60a5fa', fact: 'Europe has many countries close together, like France, Germany and Italy.', countries: '44' },
  { id: 'Oceania', emoji: '🦘', color: '#2dd4bf', fact: 'Oceania (Australia and the Pacific islands) is the smallest continent by land.', countries: '14' },
];

export interface Ocean {
  id: string;
  name: string;
  /** Points (lon, lat) inside the ocean, used for tap detection and labels. */
  points: [number, number][];
  fact: string;
}

export const OCEANS: Ocean[] = [
  { id: 'pacific', name: 'Pacific Ocean', points: [[-150, 10], [-130, -25], [160, 25], [170, -15], [-160, 40]], fact: 'The Pacific is the biggest and deepest ocean. It is bigger than all the land on Earth put together!' },
  { id: 'atlantic', name: 'Atlantic Ocean', points: [[-40, 30], [-20, -20], [-50, 5], [-30, 50]], fact: 'The Atlantic is the second-biggest ocean. It lies between the Americas and Europe and Africa.' },
  { id: 'indian', name: 'Indian Ocean', points: [[78, -15], [65, -30], [90, -5], [60, 0]], fact: 'The Indian Ocean is the third-biggest ocean - and the warmest. It is named after India.' },
  { id: 'southern', name: 'Southern Ocean', points: [[0, -60], [90, -62], [-120, -64], [150, -60]], fact: 'The Southern Ocean goes all the way around Antarctica.' },
  { id: 'arctic', name: 'Arctic Ocean', points: [[0, 85], [-150, 78], [120, 80], [40, 82]], fact: 'The Arctic Ocean is the smallest and coldest ocean, around the North Pole. Much of it is frozen.' },
];
