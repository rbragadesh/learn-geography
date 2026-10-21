// Builds the simplified TopoJSON map files in public/data/ from public-domain / open sources.
//
//   npm run maps
//
// Sources
// - World countries: Natural Earth 10m admin-0, India point-of-view edition (public domain).
//   Uses the borders India officially shows (all of J&K and Ladakh), which matches Indian school atlases.
// - India states: datta07/INDIAN-SHAPEFILES (Survey of India based boundaries, includes Ladakh UT).
//   Dadra & Nagar Haveli and Daman & Diu are merged here into the single UT created in 2020.
// - Rivers and physical regions: Natural Earth 10m (public domain).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mapshaper from 'mapshaper';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cache = path.join(root, '.cache', 'maps');
const out = path.join(root, 'public', 'data');
fs.mkdirSync(cache, { recursive: true });
fs.mkdirSync(out, { recursive: true });

const NE = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson';
const SOURCES = {
  world: `${NE}/ne_10m_admin_0_countries_ind.geojson`,
  rivers: `${NE}/ne_10m_rivers_lake_centerlines.geojson`,
  regions: `${NE}/ne_10m_geography_regions_polys.geojson`,
  india: 'https://raw.githubusercontent.com/datta07/INDIAN-SHAPEFILES/master/INDIA/INDIA_STATES.geojson',
};

async function fetchCached(key) {
  const file = path.join(cache, `${key}.geojson`);
  if (!fs.existsSync(file)) {
    console.log(`downloading ${SOURCES[key]}`);
    const res = await fetch(SOURCES[key]);
    if (!res.ok) throw new Error(`${res.status} ${SOURCES[key]}`);
    fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()));
  }
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

async function run(cmd, inputs) {
  const output = await mapshaper.applyCommands(cmd, inputs);
  return output;
}

function kb(file) {
  return `${(fs.statSync(file).size / 1024).toFixed(0)} KB`;
}

// ---------- India states ----------
const STATE_IDS = {
  'Andaman & Nicobar': 'AN', 'Andhra Pradesh': 'AP', 'Arunachal Pradesh': 'AR', Assam: 'AS', Bihar: 'BR',
  Chandigarh: 'CH', Chhattisgarh: 'CG', 'Dadra & Nagar Haveli': 'DD', 'Daman & Diu': 'DD', Delhi: 'DL',
  Goa: 'GA', Gujarat: 'GJ', Haryana: 'HR', 'Himachal Pradesh': 'HP', 'Jammu & Kashmir': 'JK', Jharkhand: 'JH',
  Karnataka: 'KA', Kerala: 'KL', Ladakh: 'LA', Lakshadweep: 'LD', 'Madhya Pradesh': 'MP', Maharashtra: 'MH',
  Manipur: 'MN', Meghalaya: 'ML', Mizoram: 'MZ', Nagaland: 'NL', Odisha: 'OD', Puducherry: 'PY', Punjab: 'PB',
  Rajasthan: 'RJ', Sikkim: 'SK', 'Tamil Nadu': 'TN', Telangana: 'TG', Tripura: 'TR', 'Uttar Pradesh': 'UP',
  Uttarakhand: 'UK', 'West Bengal': 'WB',
};

async function buildIndia() {
  const src = await fetchCached('india');
  for (const f of src.features) {
    const name = f.properties.STNAME_SH;
    const id = STATE_IDS[name];
    if (!id) throw new Error(`Unknown state name in source: ${name}`);
    f.properties = { id };
  }
  const ids = new Set(src.features.map((f) => f.properties.id));
  if (ids.size !== 36) throw new Error(`Expected 36 states/UTs, got ${ids.size}`);
  const file = path.join(out, 'india.json');
  const res = await run(
    '-i src.json name=states -dissolve2 id -simplify 7% keep-shapes -clean -o format=topojson quantization=100000 india.json',
    { 'src.json': src },
  );
  fs.writeFileSync(file, res['india.json']);
  console.log(`india.json ${kb(file)}`);
}

// ---------- World countries + continents ----------
async function buildWorld() {
  const src = await fetchCached('world');
  for (const f of src.features) {
    const p = f.properties;
    let id = p.ISO_A3_EH && p.ISO_A3_EH !== '-99' ? p.ISO_A3_EH : p.ADM0_A3;
    if (p.ADM0_A3 === 'SDS') id = 'SSD';
    f.properties = {
      id,
      name: p.NAME,
      cont: p.CONTINENT,
      lx: Math.round(p.LABEL_X * 100) / 100,
      ly: Math.round(p.LABEL_Y * 100) / 100,
    };
  }
  // Some ISO codes appear on more than one feature (overseas pieces) - dissolve by id.
  const simplified = await run(
    '-i src.json name=countries -dissolve2 id copy-fields=name,cont,lx,ly -simplify 4% keep-shapes -clean -o format=geojson precision=0.001 countries.json',
    { 'src.json': src },
  );
  const countries = JSON.parse(simplified['countries.json']);

  // Continents: dissolve countries by continent. Russia is split roughly along the Urals (60°E)
  // so Europe looks the way it does in a school atlas, and overseas pieces of countries
  // (French Guiana, Réunion, Hawaii...) are assigned to the continent they sit on.
  const russia = { type: 'FeatureCollection', features: countries.features.filter((f) => f.properties.id === 'RUS') };
  const eu = await run('-i rus.json -clip bbox=19,40,60,82 -o format=geojson eu.json', { 'rus.json': russia });
  const as = await run('-i rus.json -erase bbox=19,40,60,82 -o format=geojson as.json', { 'rus.json': russia });
  const tag = (fc, cont) => JSON.parse(fc).features.map((f) => ({ ...f, properties: { cont } }));
  const parts = [];
  for (const f of countries.features) {
    const { id, cont } = f.properties;
    if (id === 'RUS' || !f.geometry) continue;
    const polys = f.geometry.type === 'MultiPolygon' ? f.geometry.coordinates : [f.geometry.coordinates];
    for (const poly of polys) {
      const b = bboxOf({ coordinates: poly });
      const c = continentFor(cont, (b[0] + b[2]) / 2, (b[1] + b[3]) / 2);
      if (c) parts.push({ type: 'Feature', properties: { cont: c }, geometry: { type: 'Polygon', coordinates: poly } });
    }
  }
  parts.push(...tag(eu['eu.json'], 'Europe'), ...tag(as['as.json'], 'Asia'));
  const file = path.join(out, 'world.json');
  const res = await run(
    [
      '-i countries.json name=countries',
      '-i parts.json name=continents -dissolve2 cont -clean',
      '-o target=countries,continents format=topojson quantization=100000 world.json',
    ].join(' '),
    { 'countries.json': countries, 'parts.json': { type: 'FeatureCollection', features: parts } },
  );
  fs.writeFileSync(file, res['world.json']);
  console.log(`world.json ${kb(file)}`);
}

// Which continent a piece of land belongs to. Natural Earth gives each country one continent,
// which paints e.g. French Guiana as "Europe"; pieces far from home are re-assigned by position.
function continentFor(cont, lon, lat) {
  const inEurope = lon > -25 && lon < 60 && lat > 34 && lat < 82;
  const inNorthAmerica = lon < -50 && lat > 7;
  const homeOk = {
    Europe: inEurope,
    'North America': inNorthAmerica || (lon < -10 && lat > 59),
    'South America': lon < -30 && lat < 13,
    Africa: lon > -26 && lon < 60 && lat < 38,
    Asia: lon > 25 && lat > -11,
    Oceania: lon > 110 || lon < -120 || lat < -10,
    Antarctica: lat < -60,
  };
  if (cont !== 'Seven seas (open ocean)' && homeOk[cont]) return cont;
  if (lat < -60) return 'Antarctica';
  if (lon < -30) {
    if (lat < 13 && lon > -95) return 'South America';
    if (lon < -140 && lat < 30) return 'Oceania';
    return 'North America';
  }
  if (lon > 110 || lon < -120 || (lat < -10 && lon > 90)) return 'Oceania';
  if (lon > 60 || (lon > 25 && lat > 12)) return 'Asia';
  if (lon > -26 && lat < 38) return 'Africa';
  return null;
}

// ---------- Physical: rivers + regions ----------
// [id, display name, Natural Earth names, bbox filter [w,s,e,n]]
const RIVERS = [
  ['ganga', 'Ganga', ['Ganges'], [73, 20, 92, 32]],
  ['yamuna', 'Yamuna', ['Yamuna'], [75, 24, 80, 32]],
  ['brahmaputra', 'Brahmaputra', ['Brahmaputra', 'Yarlung'], [80, 22, 98, 32]],
  ['godavari', 'Godavari', ['Godävari'], [72, 15, 84, 21]],
  ['krishna', 'Krishna', ['Krishna'], [72, 14, 82, 19]],
  ['kaveri', 'Kaveri', ['Cauvery'], [74, 9, 81, 14]],
  ['narmada', 'Narmada', ['Narmada'], [71, 20, 83, 24]],
  ['tapi', 'Tapi', ['Tapi'], [72, 20, 79, 23]],
  ['mahanadi', 'Mahanadi', ['Mahäna Nadï'], [80, 19, 88, 24]],
  ['indus', 'Indus', ['Indus'], [65, 22, 82, 37]],
  ['sutlej', 'Sutlej', ['Sutlej'], [70, 28, 82, 33]],
  ['chambal', 'Chambal', ['Chambal'], [74, 22, 80, 27]],
  ['ghaghara', 'Ghaghara', ['Ghäghara'], [79, 25, 85, 31]],
  ['tungabhadra', 'Tungabhadra', ['Tungabhadra'], [74, 12, 79, 17]],
  ['nile', 'Nile', ['Nile', 'White Nile', 'Albert Nile', 'Victoria Nile'], [24, -5, 36, 32]],
  ['amazon', 'Amazon', ['Amazonas'], [-80, -10, -45, 5]],
  ['yangtze', 'Yangtze', ['Yangtze', 'Chang Jiang'], [88, 23, 123, 36]],
  ['huanghe', 'Yellow River (Huang He)', ['Huang'], [94, 32, 120, 42]],
  ['mississippi', 'Mississippi', ['Mississippi'], [-96, 28, -88, 48]],
  ['volga', 'Volga', ['Volga'], [30, 44, 55, 60]],
  ['danube', 'Danube', ['Danube'], [7, 42, 30, 50]],
  ['mekong', 'Mekong', ['Mekong'], [93, 8, 110, 34]],
  ['congo', 'Congo', ['Congo'], [10, -15, 32, 6]],
  ['niger', 'Niger', ['Niger'], [-12, 3, 10, 18]],
  ['murray', 'Murray', ['Murray'], [138, -38, 149, -33]],
  ['thames', 'Thames', ['Thames'], [-2.5, 51, 1.5, 52]],
  ['rhine', 'Rhine', ['Rhine'], [3, 46, 11, 53]],
  ['han', 'Han (Seoul)', ['Han'], [126, 36.5, 129.5, 38.5]],
  ['chaophraya', 'Chao Phraya', ['Chao Phraya'], [99, 13, 101, 16]],
  ['tigris', 'Tigris', ['Tigris'], [38, 29, 48, 39]],
  ['euphrates', 'Euphrates', ['Euphrates'], [36, 29, 48, 41]],
  ['zambezi', 'Zambezi', ['Zambezi'], [20, -20, 38, -10]],
  ['stlawrence', 'St. Lawrence', ['St. Lawrence'], [-80, 43, -60, 51]],
  ['parana', 'Paraná', ['Paraná'], [-62, -35, -45, -15]],
];

const REGIONS = [
  // India
  ['himalayas', 'Himalayas', 'HIMALAYAS', 'mountains'],
  ['westernghats', 'Western Ghats', 'WESTERN GHATS', 'mountains'],
  ['easternghats', 'Eastern Ghats', 'EASTERN GHATS', 'mountains'],
  ['aravalli', 'Aravalli Range', 'Arvalli Ra.', 'mountains'],
  ['vindhya', 'Vindhya Range', 'Vindhya Range', 'mountains'],
  ['satpura', 'Satpura Range', 'Satpura Range', 'mountains'],
  ['karakoram', 'Karakoram Range', 'KARAKORAM RA.', 'mountains'],
  ['thar', 'Thar Desert', 'THAR DESERT', 'desert'],
  ['deccan', 'Deccan Plateau', 'DECCAN PLATEAU', 'plateau'],
  ['chotanagpur', 'Chota Nagpur Plateau', 'Chota Nägpur Plateau', 'plateau'],
  ['gangesplain', 'Ganga Plain', 'GANGES PLAIN', 'plain'],
  ['sundarbans', 'Sundarbans', 'Sundarbans', 'wetland'],
  // World
  ['sahara', 'Sahara Desert', 'SAHARA', 'desert'],
  ['gobi', 'Gobi Desert', 'GOBI DESERT', 'desert'],
  ['kalahari', 'Kalahari Desert', 'KALAHARI DESERT', 'desert'],
  ['atacama', 'Atacama Desert', 'DESIERTO DE ATACAMA', 'desert'],
  ['namib', 'Namib Desert', 'NAMIB DESERT', 'desert'],
  ['greatvictoria', 'Great Victoria Desert', 'GREAT VICTORIA DESERT', 'desert'],
  ['andes', 'Andes', 'ANDES', 'mountains'],
  ['rockies', 'Rocky Mountains', 'ROCKY MOUNTAINS', 'mountains'],
  ['alps', 'Alps', 'ALPS', 'mountains'],
  ['urals', 'Ural Mountains', 'URAL MOUNTAINS', 'mountains'],
  ['appalachian', 'Appalachian Mountains', 'APPALACHIAN MTS.', 'mountains'],
  ['atlas', 'Atlas Mountains', 'ATLAS MOUNTAINS', 'mountains'],
  ['greatdividing', 'Great Dividing Range', 'GREAT DIVIDING RANGE', 'mountains'],
  ['tibet', 'Tibetan Plateau', 'PLATEAU OF TIBET', 'plateau'],
  ['amazonbasin', 'Amazon Rainforest', 'AMAZON BASIN', 'forest'],
  ['congobasin', 'Congo Rainforest', 'CONGO BASIN', 'forest'],
  ['greatplains', 'Great Plains', 'GREAT PLAINS', 'plain'],
  ['greatrift', 'Great Rift Valley', 'GREAT RIFT VALLEY', 'valley'],
];

function bboxOf(geom) {
  let w = 180, s = 90, e = -180, n = -90;
  const walk = (c) => {
    if (typeof c[0] === 'number') {
      w = Math.min(w, c[0]); e = Math.max(e, c[0]); s = Math.min(s, c[1]); n = Math.max(n, c[1]);
    } else c.forEach(walk);
  };
  walk(geom.coordinates);
  return [w, s, e, n];
}

function centerInside(b, box) {
  const cx = (b[0] + b[2]) / 2, cy = (b[1] + b[3]) / 2;
  return cx >= box[0] && cx <= box[2] && cy >= box[1] && cy <= box[3];
}

async function buildPhysical() {
  const rivers = await fetchCached('rivers');
  const regions = await fetchCached('regions');
  const riverFeatures = [];
  for (const [id, name, neNames, box] of RIVERS) {
    const parts = rivers.features.filter(
      (f) => neNames.includes(f.properties.name) && f.geometry && centerInside(bboxOf(f.geometry), box),
    );
    if (!parts.length) throw new Error(`river not found: ${id}`);
    for (const p of parts) riverFeatures.push({ type: 'Feature', properties: { id, name }, geometry: p.geometry });
  }
  const regionFeatures = [];
  for (const [id, name, neName, kind] of REGIONS) {
    const parts = regions.features.filter((f) => f.properties.NAME === neName);
    if (!parts.length) throw new Error(`region not found: ${id}`);
    for (const p of parts) regionFeatures.push({ type: 'Feature', properties: { id, name, kind }, geometry: p.geometry });
  }
  const file = path.join(out, 'physical.json');
  const res = await run(
    [
      '-i rivers.json name=rivers',
      '-dissolve id copy-fields=name',
      '-simplify 10% keep-shapes',
      '-i regions.json name=regions',
      '-dissolve2 id copy-fields=name,kind',
      '-simplify 8% keep-shapes',
      '-o target=rivers,regions format=topojson quantization=100000 physical.json',
    ].join(' '),
    {
      'rivers.json': { type: 'FeatureCollection', features: riverFeatures },
      'regions.json': { type: 'FeatureCollection', features: regionFeatures },
    },
  );
  fs.writeFileSync(file, res['physical.json']);
  console.log(`physical.json ${kb(file)}`);
}

await buildIndia();
await buildWorld();
await buildPhysical();
