// The learning engine: every fact the app teaches is a "card" with an id.
// Cards are grouped into decks (activities) and units (the Adventure Path).
// This file turns a card id into a teach step or a question, at a difficulty
// that grows with how well the card is known.
import { COUNTRIES, COUNTRY_BY_ID, CONTINENTS, OCEANS, flagOf } from '../data/countries';
import { CHAMPION_FACTS, EARTH_FACTS, MY_WORLD_FACTS, PLANETS, SKILL_FACTS, SPACE_FACTS } from '../data/facts';
import {
  INDIA_FACTS, INDIA_LANDMARKS, INDIA_NEIGHBOURS, INDIA_PHYSICAL, INDIA_RESOURCES, REGIONS, STATES, STATE_BY_ID,
  type Landmark, type PhysicalFeature, type ResourceLink,
} from '../data/india';
import type { Continent, DiagramId, Fact, IndiaRegion, LonLat } from '../data/types';
import { WORLD_LANDMARKS, WORLD_PHYSICAL, WORLD_RESOURCES } from '../data/world';
import { mapsIfLoaded } from './mapdata';
import { MASTERED_BOX, type CardState, isDue } from './srs';
import { dayNumber, pick, sample, shuffle } from './util';

// ---------------------------------------------------------------- types

export type MapKind = 'india' | 'world';
export type Layer = 'political' | 'physical' | 'continents';
export type ZoneId = 'india' | 'world' | 'skills' | 'earth' | 'space' | 'resources' | 'champion';

export type Visual =
  | { kind: 'emoji'; value: string }
  | { kind: 'flag'; iso2: string }
  | { kind: 'diagram'; id: DiagramId }
  | { kind: 'planets'; ids: string[] }
  | { kind: 'grid'; cells: (string | null)[]; eight: boolean }
  | { kind: 'map'; map: MapKind; highlight: string[]; focus?: string[]; layer?: Layer; marker?: LonLat; soft?: string[] };

export interface Option {
  id: string;
  label: string;
  emoji?: string;
  flag?: string;
}

export interface TeachStep {
  type: 'teach';
  key: string;
  title: string;
  subtitle?: string;
  lines: string[];
  visual?: Visual;
  say: string;
}

export interface McqStep {
  type: 'mcq';
  card: string;
  prompt: string;
  say: string;
  visual?: Visual;
  options: Option[];
  answer: string;
  explain: string;
}

export interface MapFindStep {
  type: 'mapFind';
  card: string;
  prompt: string;
  say: string;
  map: MapKind;
  layer: Layer;
  target: string;
  /** Other ids that also count as right (e.g. Darjeeling tea is in West Bengal too). */
  accept?: string[];
  targetKind: 'state' | 'country' | 'continent' | 'ocean';
  focus?: string[];
  explain: string;
}

export interface OrderStep {
  type: 'order';
  card: string;
  prompt: string;
  say: string;
  items: Option[]; // in the correct order
  explain: string;
}

export type QuizStep = McqStep | MapFindStep | OrderStep;
export type Step = TeachStep | QuizStep;

export interface CardDef {
  id: string;
  deck: string;
  group: string;
  label: string;
  level: number;
}

export interface Deck {
  id: string;
  zone: ZoneId;
  title: string;
  emoji: string;
  blurb: string;
  cards: string[];
  /** Activity opens a dedicated screen instead of a quiz. */
  screen?: 'india-map' | 'world-map' | 'solar' | 'passport';
}

// ---------------------------------------------------------------- card registry

const FACT_BY_ID: Record<string, Fact> = {};
const FACT_DECK: Record<string, string> = {};
for (const [deck, list] of [
  ['india-facts', INDIA_FACTS], ['space', SPACE_FACTS], ['skills', SKILL_FACTS], ['earth', EARTH_FACTS],
  ['my-world', MY_WORLD_FACTS], ['champion', CHAMPION_FACTS],
] as const) {
  for (const f of list) {
    FACT_BY_ID[f.id] = f;
    FACT_DECK[f.id] = deck;
  }
}

const IND_PHYS = Object.fromEntries(INDIA_PHYSICAL.map((p) => [p.id, p]));
const WORLD_PHYS = Object.fromEntries(WORLD_PHYSICAL.map((p) => [p.id, p]));
const IND_RES = Object.fromEntries(INDIA_RESOURCES.map((r) => [r.id, r]));
const WORLD_RES = Object.fromEntries(WORLD_RESOURCES.map((r) => [r.id, r]));
const IND_LM = Object.fromEntries(INDIA_LANDMARKS.map((l) => [l.id, l]));
const WORLD_LM = Object.fromEntries(WORLD_LANDMARKS.map((l) => [l.id, l]));
const OCEAN_BY_ID = Object.fromEntries(OCEANS.map((o) => [o.id, o]));

export const CARDS: Record<string, CardDef> = {};
function add(id: string, deck: string, group: string, label: string, level = 1) {
  CARDS[id] = { id, deck, group, label, level };
  return id;
}

for (const s of STATES) {
  add(`ic:${s.id}`, 'india-capitals', `st:${s.id}`, `Capital of ${s.name}`, 1);
  add(`im:${s.id}`, 'india-map', `st:${s.id}`, `${s.name} on the map`, 1);
  if (s.region !== 'Islands') add(`sn:${s.id}`, 'state-neighbours', `sn:${s.id}`, `Neighbours of ${s.name}`, 4);
}
for (const f of [...INDIA_FACTS, ...SPACE_FACTS, ...SKILL_FACTS, ...EARTH_FACTS, ...MY_WORLD_FACTS, ...CHAMPION_FACTS]) {
  add(`f:${f.id}`, FACT_DECK[f.id], `f:${f.id}`, f.q, f.level);
}
for (const p of INDIA_PHYSICAL) add(`ip:${p.id}`, 'india-physical', `ip:${p.id}`, p.name, p.kind === 'sea' ? 1 : 2);
for (const r of INDIA_RESOURCES) add(`ir:${r.id}`, 'india-resources', `ir:${r.id}`, `${r.resource} - ${STATE_BY_ID[r.answer].name}`, 2);
for (const l of INDIA_LANDMARKS) add(`il:${l.id}`, 'india-landmarks', `il:${l.id}`, l.name, 2);
for (const id of INDIA_NEIGHBOURS) add(`nb:${id}`, 'neighbours', `nb:${id}`, COUNTRY_BY_ID[id].name, 1);
for (const c of CONTINENTS) add(`ct:${c.id}`, 'continents', `ct:${c.id}`, c.id, 1);
for (const o of OCEANS) add(`oc:${o.id}`, 'continents', `oc:${o.id}`, o.name, 1);
for (const c of COUNTRIES) {
  if (!c.noCapitalQuiz) add(`wc:${c.id}`, 'world-capitals', `co:${c.id}`, `Capital of ${c.name}`, c.tier + 1);
  add(`wf:${c.id}`, 'world-flags', `co:${c.id}`, `Flag of ${c.name}`, c.tier + 1);
  add(`wm:${c.id}`, 'world-map', `co:${c.id}`, `${c.name} on the map`, c.tier + 1);
}
for (const l of WORLD_LANDMARKS) add(`wl:${l.id}`, 'world-landmarks', `wl:${l.id}`, l.name, 2);
for (const r of WORLD_RESOURCES) add(`wr:${r.id}`, 'world-resources', `wr:${r.id}`, `${r.resource} - ${COUNTRY_BY_ID[r.answer].name}`, 3);
for (const p of WORLD_PHYSICAL) add(`wp:${p.id}`, 'world-physical', `wp:${p.id}`, p.name, 3);
add('po:inner', 'planet-order', 'po:inner', 'Order of the rocky planets', 1);
add('po:all', 'planet-order', 'po:all', 'Order of all 8 planets', 2);
add('po:size', 'planet-order', 'po:size', 'Planets from smallest to biggest', 3);
add('cg:4', 'compass', 'cg:4', 'Directions game (4 directions)', 1);
add('cg:8', 'compass', 'cg:8', 'Directions game (8 directions)', 2);

const cardsOf = (deck: string) => Object.values(CARDS).filter((c) => c.deck === deck).map((c) => c.id);
const tierCards = (prefix: string, tier: number) => COUNTRIES.filter((c) => c.tier === tier && CARDS[`${prefix}:${c.id}`]).map((c) => `${prefix}:${c.id}`);

// ---------------------------------------------------------------- decks (zone activities)

export const ZONES: { id: ZoneId; title: string; emoji: string; color: string; blurb: string }[] = [
  { id: 'india', title: 'India', emoji: '🇮🇳', color: '#ff9933', blurb: 'States, capitals, rivers and more' },
  { id: 'world', title: 'World', emoji: '🌏', color: '#3b82f6', blurb: 'Continents, countries and flags' },
  { id: 'skills', title: 'Map Skills', emoji: '🧭', color: '#14b8a6', blurb: 'Directions, globes and maps' },
  { id: 'earth', title: 'Our Earth', emoji: '🌋', color: '#f97316', blurb: 'Mountains, rivers, weather' },
  { id: 'space', title: 'Space', emoji: '🪐', color: '#7c3aed', blurb: 'Sun, Moon and planets' },
  { id: 'resources', title: 'Resources', emoji: '⛏️', color: '#ca8a04', blurb: 'Crops, minerals and energy' },
  { id: 'champion', title: 'Geo Champion', emoji: '🏆', color: '#e11d48', blurb: 'Olympiad challenges' },
];

export const DECKS: Deck[] = [
  { id: 'india-explore', zone: 'india', title: 'Explore the India map', emoji: '🗺️', blurb: 'Tap any state to learn about it', cards: [], screen: 'india-map' },
  { id: 'india-capitals', zone: 'india', title: 'State capitals', emoji: '⭐', blurb: 'All 36 capitals', cards: cardsOf('india-capitals') },
  { id: 'india-map', zone: 'india', title: 'Find the state', emoji: '👆', blurb: 'Point to states on the map', cards: cardsOf('india-map') },
  { id: 'india-facts', zone: 'india', title: 'India big facts', emoji: '🇮🇳', blurb: 'Seas, size, neighbours', cards: cardsOf('india-facts') },
  { id: 'neighbours', zone: 'india', title: 'India\'s neighbours', emoji: '🤝', blurb: 'Countries around India', cards: cardsOf('neighbours') },
  { id: 'india-physical', zone: 'india', title: 'Rivers, mountains, seas', emoji: '🏞️', blurb: 'India\'s physical map', cards: cardsOf('india-physical') },
  { id: 'india-landmarks', zone: 'india', title: 'Famous places', emoji: '🕌', blurb: 'Taj Mahal and friends', cards: cardsOf('india-landmarks') },
  { id: 'world-explore', zone: 'world', title: 'Explore the world map', emoji: '🗺️', blurb: 'Tap any country', cards: [], screen: 'world-map' },
  { id: 'continents', zone: 'world', title: 'Continents and oceans', emoji: '🌍', blurb: '7 continents, 5 oceans', cards: cardsOf('continents') },
  { id: 'my-world', zone: 'world', title: 'My countries', emoji: '🧳', blurb: 'Singapore, Korea, Taiwan, Indonesia', cards: [...['IND', 'SGP', 'KOR', 'TWN', 'IDN'].flatMap(countryCards), ...cardsOf('my-world')] },
  { id: 'world-capitals', zone: 'world', title: 'Capitals of the world', emoji: '🏙️', blurb: 'Starts with the famous ones', cards: [...tierCards('wc', 1), ...tierCards('wc', 2), ...tierCards('wc', 3)] },
  { id: 'world-flags', zone: 'world', title: 'Flags', emoji: '🏳️', blurb: 'Which flag is which?', cards: [...tierCards('wf', 1), ...tierCards('wf', 2), ...tierCards('wf', 3)] },
  { id: 'world-map', zone: 'world', title: 'Find the country', emoji: '👆', blurb: 'Point to countries', cards: [...tierCards('wm', 1), ...tierCards('wm', 2), ...tierCards('wm', 3)] },
  { id: 'world-landmarks', zone: 'world', title: 'World wonders', emoji: '🗼', blurb: 'Famous places on Earth', cards: cardsOf('world-landmarks') },
  { id: 'passport', zone: 'world', title: 'My passport', emoji: '🛂', blurb: 'Stamps for countries you know', cards: [], screen: 'passport' },
  { id: 'skills', zone: 'skills', title: 'Map skills', emoji: '🧭', blurb: 'Directions, keys, globes', cards: cardsOf('skills') },
  { id: 'compass', zone: 'skills', title: 'Directions game', emoji: '🏠', blurb: 'North, south, east, west', cards: cardsOf('compass') },
  { id: 'earth', zone: 'earth', title: 'Our Earth', emoji: '🌋', blurb: 'Landforms, water, weather', cards: cardsOf('earth') },
  { id: 'world-physical', zone: 'earth', title: 'World rivers and mountains', emoji: '🏔️', blurb: 'Nile, Amazon, Andes...', cards: cardsOf('world-physical') },
  { id: 'solar', zone: 'space', title: 'Explore the solar system', emoji: '🔭', blurb: 'Tap a planet', cards: [], screen: 'solar' },
  { id: 'space', zone: 'space', title: 'Space quiz', emoji: '🚀', blurb: 'Sun, Moon, planets, missions', cards: cardsOf('space') },
  { id: 'planet-order', zone: 'space', title: 'Planet order', emoji: '🪐', blurb: 'Put the planets in line', cards: cardsOf('planet-order') },
  { id: 'india-resources', zone: 'resources', title: 'India\'s crops and minerals', emoji: '🌾', blurb: 'Tea, coffee, coal...', cards: cardsOf('india-resources') },
  { id: 'world-resources', zone: 'resources', title: 'World resources', emoji: '🛢️', blurb: 'Who grows and mines what', cards: cardsOf('world-resources') },
  { id: 'energy', zone: 'resources', title: 'Energy and our planet', emoji: '♻️', blurb: 'Renewable or not?', cards: ['ea39', 'ea40', 'ea41', 'ea42', 'ea43', 'ea47'].map((x) => `f:${x}`) },
  { id: 'champion', zone: 'champion', title: 'Champion questions', emoji: '🏆', blurb: 'Geography-bee style', cards: cardsOf('champion') },
  { id: 'state-neighbours', zone: 'champion', title: 'State neighbours', emoji: '🧩', blurb: 'Which states touch?', cards: cardsOf('state-neighbours') },
  { id: 'all-capitals', zone: 'champion', title: 'Every capital', emoji: '🌐', blurb: 'All 190+ countries', cards: Object.keys(CARDS).filter((c) => c.startsWith('wc:')) },
];

export const DECK_BY_ID = Object.fromEntries(DECKS.map((d) => [d.id, d]));

function countryCards(id: string): string[] {
  return ['wc', 'wf', 'wm'].map((p) => `${p}:${id}`).filter((c) => CARDS[c]);
}

function stateCards(ids: string[]): string[] {
  return ids.flatMap((id) => [`ic:${id}`, `im:${id}`]);
}

const facts = (...ids: string[]) => ids.map((x) => `f:${x}`);
const factsByLevel = (list: Fact[], lo: number, hi: number) => list.filter((f) => f.level >= lo && f.level <= hi).map((f) => `f:${f.id}`);
const continentCountries = (cont: Continent, tiers: number[]) =>
  COUNTRIES.filter((c) => c.continent === cont && tiers.includes(c.tier) && !['IND', 'SGP', 'KOR', 'TWN', 'IDN'].includes(c.id) && !INDIA_NEIGHBOURS.includes(c.id)).flatMap((c) => countryCards(c.id));

// ---------------------------------------------------------------- Adventure Path

export interface Unit {
  id: string;
  title: string;
  emoji: string;
  zone: ZoneId;
  cards: string[];
}

export const UNITS: Unit[] = [
  { id: 'u-mapmagic', title: 'Map Magic', emoji: '🧭', zone: 'skills', cards: [...factsByLevel(SKILL_FACTS, 1, 1), 'cg:4'] },
  { id: 'u-continents', title: 'Continents and Oceans', emoji: '🌍', zone: 'world', cards: cardsOf('continents') },
  { id: 'u-hello-india', title: 'Hello India', emoji: '🇮🇳', zone: 'india', cards: [...facts('inb1', 'inb2', 'inb3', 'inb4', 'inb5', 'inb6', 'inb7'), 'ip:arabiansea', 'ip:bayofbengal', 'ip:indianocean'] },
  { id: 'u-north1', title: 'North India: the plains', emoji: '🕌', zone: 'india', cards: stateCards(['DL', 'UP', 'PB', 'HR', 'CH']) },
  { id: 'u-space1', title: 'Our Solar System', emoji: '🪐', zone: 'space', cards: [...factsByLevel(SPACE_FACTS, 1, 1), 'po:inner'] },
  { id: 'u-north2', title: 'North India: the mountains', emoji: '🏔️', zone: 'india', cards: stateCards(['JK', 'LA', 'HP', 'UK']) },
  { id: 'u-mycountries', title: 'My Countries', emoji: '🧳', zone: 'world', cards: [...['SGP', 'KOR', 'TWN', 'IDN', 'IND'].flatMap(countryCards), ...factsByLevel(MY_WORLD_FACTS, 1, 2)] },
  { id: 'u-west', title: 'West India', emoji: '🐪', zone: 'india', cards: stateCards(['RJ', 'GJ', 'MH', 'GA', 'DD']) },
  { id: 'u-landforms', title: 'Landforms and Water', emoji: '🏞️', zone: 'earth', cards: facts('ea1', 'ea2', 'ea3', 'ea4', 'ea5', 'ea6', 'ea7', 'ea9', 'ea10', 'ea11', 'ea12', 'ea44', 'ea45') },
  { id: 'u-south1', title: 'South India: Karnataka, Kerala, Tamil Nadu', emoji: '🥥', zone: 'india', cards: stateCards(['KA', 'KL', 'TN']) },
  { id: 'u-south2', title: 'South India: Andhra, Telangana, Puducherry', emoji: '🌶️', zone: 'india', cards: stateCards(['AP', 'TG', 'PY']) },
  { id: 'u-neighbours', title: 'India\'s Neighbours', emoji: '🤝', zone: 'india', cards: [...cardsOf('neighbours'), ...['LKA', 'MDV'].flatMap(countryCards), 'f:inb19'] },
  { id: 'u-central-east', title: 'Central and East India', emoji: '🐯', zone: 'india', cards: stateCards(['MP', 'CG', 'BR', 'JH', 'OD', 'WB']) },
  { id: 'u-earthsky', title: 'Earth and Sky', emoji: '🌗', zone: 'space', cards: [...factsByLevel(SPACE_FACTS, 2, 2), ...facts('ea20', 'ea21', 'ea22', 'ea24', 'ms13', 'ms14'), 'po:all', 'cg:8'] },
  { id: 'u-northeast1', title: 'Northeast: Assam and friends', emoji: '🦏', zone: 'india', cards: stateCards(['AS', 'AR', 'ML', 'SK']) },
  { id: 'u-northeast2', title: 'Northeast: the hill states', emoji: '🎋', zone: 'india', cards: stateCards(['NL', 'MN', 'MZ', 'TR']) },
  { id: 'u-islands', title: 'Islands of India', emoji: '🏝️', zone: 'india', cards: [...stateCards(['AN', 'LD']), ...facts('inb8', 'inb9', 'inb10', 'inb11', 'inb12', 'inb13', 'inb20')] },
  { id: 'u-rivers', title: 'Rivers and Mountains of India', emoji: '🌊', zone: 'india', cards: INDIA_PHYSICAL.filter((p) => p.kind !== 'sea').map((p) => `ip:${p.id}`) },
  { id: 'u-in-resources', title: 'What India Grows and Mines', emoji: '🌾', zone: 'resources', cards: [...cardsOf('india-resources'), ...facts('ea39', 'ea40', 'ea41', 'ea42', 'ea47')] },
  { id: 'u-in-landmarks', title: 'Famous Places of India', emoji: '🕌', zone: 'india', cards: cardsOf('india-landmarks') },
  { id: 'u-asia', title: 'Countries of Asia', emoji: '🐼', zone: 'world', cards: continentCountries('Asia', [1, 2]) },
  { id: 'u-skills2', title: 'Equator, Poles and Hemispheres', emoji: '🌐', zone: 'skills', cards: factsByLevel(SKILL_FACTS, 2, 2) },
  { id: 'u-europe', title: 'Countries of Europe', emoji: '🏰', zone: 'world', cards: continentCountries('Europe', [1, 2]) },
  { id: 'u-water', title: 'Water, Weather and Earth\'s Insides', emoji: '🌧️', zone: 'earth', cards: facts('ea8', 'ea13', 'ea14', 'ea15', 'ea16', 'ea23', 'ea25', 'ea28', 'ea29', 'ea30', 'ea32', 'ea33', 'ea35', 'ea36', 'ea46') },
  { id: 'u-africa', title: 'Countries of Africa', emoji: '🦁', zone: 'world', cards: continentCountries('Africa', [1, 2]) },
  { id: 'u-americas', title: 'The Americas', emoji: '🦅', zone: 'world', cards: [...continentCountries('North America', [1, 2]), ...continentCountries('South America', [1, 2])] },
  { id: 'u-oceania', title: 'Oceania and World Wonders', emoji: '🦘', zone: 'world', cards: [...continentCountries('Oceania', [1, 2]), ...cardsOf('world-landmarks')] },
  { id: 'u-world-res', title: 'World Resources', emoji: '🛢️', zone: 'resources', cards: [...cardsOf('world-resources'), 'f:ea43'] },
  { id: 'u-space2', title: 'Space Explorers', emoji: '🚀', zone: 'space', cards: [...factsByLevel(SPACE_FACTS, 3, 3), 'po:size'] },
  { id: 'u-skills3', title: 'Latitude, Longitude and Time', emoji: '🕰️', zone: 'skills', cards: factsByLevel(SKILL_FACTS, 3, 3) },
  { id: 'u-earth3', title: 'Volcanoes, Rivers and Biomes', emoji: '🌋', zone: 'earth', cards: [...factsByLevel(EARTH_FACTS, 3, 3), ...cardsOf('world-physical')] },
  { id: 'u-india-expert', title: 'India Expert', emoji: '🧩', zone: 'champion', cards: [...facts('inb14', 'inb15', 'inb16', 'inb17', 'inb18'), ...cardsOf('state-neighbours')] },
  { id: 'u-champion1', title: 'Geo Champion: Level 1', emoji: '🥉', zone: 'champion', cards: [...factsByLevel(CHAMPION_FACTS, 2, 3), ...factsByLevel(MY_WORLD_FACTS, 3, 3)] },
  { id: 'u-champion2', title: 'Geo Champion: Level 2', emoji: '🥈', zone: 'champion', cards: [...factsByLevel(CHAMPION_FACTS, 4, 4), ...factsByLevel(SPACE_FACTS, 4, 4), ...factsByLevel(SKILL_FACTS, 4, 4), ...factsByLevel(MY_WORLD_FACTS, 4, 4)] },
  { id: 'u-champion3', title: 'Geo Champion: Level 3', emoji: '🥇', zone: 'champion', cards: [...factsByLevel(CHAMPION_FACTS, 5, 5), ...factsByLevel(MY_WORLD_FACTS, 5, 5)] },
  { id: 'u-allworld', title: 'Every Country on Earth', emoji: '🌐', zone: 'world', cards: COUNTRIES.filter((c) => c.tier === 3).flatMap((c) => countryCards(c.id)) },
];

export function orderedUnits(focus: 'path' | 'india-first'): Unit[] {
  if (focus === 'path') return UNITS;
  return [...UNITS.filter((u) => u.zone === 'india'), ...UNITS.filter((u) => u.zone !== 'india')];
}

export function unitProgress(unit: Unit, cards: Record<string, CardState>): number {
  if (!unit.cards.length) return 0;
  const sum = unit.cards.reduce((acc, id) => acc + Math.min(cards[id]?.box ?? 0, MASTERED_BOX) / MASTERED_BOX, 0);
  return sum / unit.cards.length;
}

export function currentUnit(focus: 'path' | 'india-first', cards: Record<string, CardState>): Unit {
  return orderedUnits(focus).find((u) => u.cards.some((c) => !cards[c])) ?? UNITS[UNITS.length - 1];
}

// ---------------------------------------------------------------- helpers for questions

const STATE_CAPITALS = [...new Set(STATES.map((s) => s.capital))];

function stateOptions(answer: string, opts: { avoid?: string[]; n: number; region?: IndiaRegion }): Option[] {
  const avoid = new Set([answer, ...(opts.avoid ?? [])]);
  let pool = STATES.filter((s) => !avoid.has(s.id));
  if (opts.region) {
    const same = pool.filter((s) => s.region === opts.region);
    if (same.length >= opts.n - 1) pool = same;
  }
  const picks = sample(pool, opts.n - 1);
  return shuffle([STATE_BY_ID[answer], ...picks]).map((s) => ({ id: s.id, label: s.name }));
}

function countryOptions(answer: string, opts: { avoid?: string[]; n: number; sameContinent?: boolean; withFlag?: boolean; tierMax?: number }): Option[] {
  const ans = COUNTRY_BY_ID[answer];
  const avoid = new Set([answer, ...(opts.avoid ?? [])]);
  let pool = COUNTRIES.filter((c) => !avoid.has(c.id) && c.tier <= (opts.tierMax ?? 3));
  if (opts.sameContinent) {
    const same = pool.filter((c) => c.continent === ans.continent);
    if (same.length >= opts.n - 1) pool = same;
  }
  return shuffle([ans, ...sample(pool, opts.n - 1)]).map((c) => ({ id: c.id, label: c.name, flag: opts.withFlag ? flagOf(c.iso2) : undefined }));
}

const n = (box: number) => (box >= 2 ? 4 : 3);

function stateMapVisual(id: string, extra: Partial<Extract<Visual, { kind: 'map' }>> = {}): Visual {
  return { kind: 'map', map: 'india', highlight: [id], ...extra };
}

function countryMapVisual(id: string): Visual {
  const c = COUNTRY_BY_ID[id];
  const nbs = mapsIfLoaded()?.countryNeighbors[id] ?? [];
  return { kind: 'map', map: 'world', highlight: [id], focus: c ? [id, ...nbs.slice(0, 6)] : undefined };
}

function factVisual(f: Fact): Visual | undefined {
  if (f.diagram) return { kind: 'diagram', id: f.diagram };
  if (f.map) {
    const ids = f.map.ids;
    const phys = ids.some((x) => IND_PHYS[x]);
    return { kind: 'map', map: f.map.kind, highlight: ids, layer: phys ? 'physical' : 'political' };
  }
  if (f.emoji) return { kind: 'emoji', value: f.emoji };
  return undefined;
}

function speakCapital(stateId: string): string {
  const s = STATE_BY_ID[stateId];
  return s.sayCapital ?? s.capital;
}

// ---------------------------------------------------------------- teach steps

export function teachFor(cardId: string): TeachStep {
  const group = CARDS[cardId]?.group ?? cardId;
  const [kind, id] = group.split(/:(.+)/);
  switch (kind) {
    case 'st': {
      const s = STATE_BY_ID[id];
      return {
        type: 'teach', key: group, title: s.name,
        subtitle: `Capital: ${s.capital}`,
        lines: [...(s.capitalNote ? [s.capitalNote] : []), s.funFact, ...s.famousFor.map((x) => `${s.emoji} ${x}`)],
        visual: stateMapVisual(id, { marker: s.capitalLL }),
        say: `This is ${s.name}. Its capital is ${speakCapital(id)}. ${s.funFact}`,
      };
    }
    case 'co': case 'nb': {
      const c = COUNTRY_BY_ID[id];
      return {
        type: 'teach', key: group, title: `${flagOf(c.iso2)} ${c.name}`,
        subtitle: `Capital: ${c.capital} · ${c.continent}`,
        lines: [c.fact ?? `${c.name} is a country in ${c.continent}.`, ...(c.capitalNote ? [c.capitalNote] : [])],
        visual: countryMapVisual(id),
        say: `This is ${c.name}. ${c.noCapitalQuiz ? '' : `Its capital is ${c.capital}.`} ${c.fact ?? ''}`,
      };
    }
    case 'ct': {
      const c = CONTINENTS.find((x) => x.id === id)!;
      return {
        type: 'teach', key: group, title: `${c.emoji} ${c.id}`, lines: [c.fact],
        visual: { kind: 'map', map: 'world', highlight: [c.id], layer: 'continents' },
        say: c.fact,
      };
    }
    case 'oc': {
      const o = OCEAN_BY_ID[id];
      return {
        type: 'teach', key: group, title: `🌊 ${o.name}`, lines: [o.fact],
        visual: { kind: 'map', map: 'world', highlight: [], layer: 'continents', marker: o.points[0] },
        say: `This is the ${o.name}. ${o.fact}`,
      };
    }
    case 'ip': case 'wp': {
      const p = (kind === 'ip' ? IND_PHYS : WORLD_PHYS)[id];
      return {
        type: 'teach', key: group, title: `${p.emoji} ${p.name}`, lines: [p.fact],
        visual: physicalVisual(p, kind === 'ip' ? 'india' : 'world'),
        say: `This is the ${p.name}. ${p.fact}`,
      };
    }
    case 'ir': case 'wr': {
      const r = (kind === 'ir' ? IND_RES : WORLD_RES)[id];
      const place = kind === 'ir' ? STATE_BY_ID[r.answer].name : COUNTRY_BY_ID[r.answer].name;
      return {
        type: 'teach', key: group, title: `${r.emoji} ${r.resource}`, subtitle: `Famous in: ${place}`, lines: [r.fact],
        visual: kind === 'ir' ? stateMapVisual(r.answer, { soft: r.alsoOk }) : countryMapVisual(r.answer),
        say: r.fact,
      };
    }
    case 'il': case 'wl': {
      const l = (kind === 'il' ? IND_LM : WORLD_LM)[id];
      const place = kind === 'il' ? STATE_BY_ID[l.where].name : COUNTRY_BY_ID[l.where].name;
      return {
        type: 'teach', key: group, title: `${l.emoji} ${l.name}`, subtitle: `In ${place}`, lines: [l.fact],
        visual: kind === 'il' ? stateMapVisual(l.where) : countryMapVisual(l.where),
        say: `The ${l.name} is in ${place}. ${l.fact}`,
      };
    }
    case 'po':
      return {
        type: 'teach', key: group, title: '🪐 The planets in order',
        lines: ['From the Sun: Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune.', 'Remember it with: My Very Educated Mother Just Served Us Noodles!'],
        visual: { kind: 'planets', ids: PLANETS.map((p) => p.id) },
        say: 'From the Sun, the planets are Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus and Neptune. Remember: My Very Educated Mother Just Served Us Noodles!',
      };
    case 'cg':
      return {
        type: 'teach', key: group, title: '🧭 Directions',
        lines: id === '8'
          ? ['Between the main directions are North-East, South-East, South-West and North-West.']
          : ['On a map, North is up, South is down, East is right and West is left.', 'Remember: Never Eat Soggy Waffles!'],
        visual: { kind: 'diagram', id: 'compass' },
        say: id === '8'
          ? 'Between the main directions are North-East, South-East, South-West and North-West.'
          : 'On a map, North is up, South is down, East is to the right and West is to the left. Never Eat Soggy Waffles!',
      };
    case 'sn': {
      const s = STATE_BY_ID[id];
      const nbs = mapsIfLoaded()?.stateNeighbors[id] ?? [];
      const names = nbs.map((x) => STATE_BY_ID[x]?.name).filter(Boolean);
      return {
        type: 'teach', key: group, title: `🧩 ${s.name}'s neighbours`, lines: [`${s.name} touches: ${names.join(', ')}.`],
        visual: { kind: 'map', map: 'india', highlight: [id], soft: nbs },
        say: `${s.name} shares a border with ${names.join(', ')}.`,
      };
    }
    case 'f': {
      const f = FACT_BY_ID[id];
      return { type: 'teach', key: group, title: '💡 Did you know?', subtitle: f.q, lines: [`${f.a}!`, f.explain], visual: factVisual(f), say: `${f.q} ${f.a}. ${f.explain}` };
    }
    default:
      return { type: 'teach', key: group, title: 'Let\'s learn', lines: [], say: '' };
  }
}

function physicalVisual(p: PhysicalFeature, map: MapKind): Visual {
  if (p.kind === 'sea' && p.at) return { kind: 'map', map, highlight: [p.id], layer: 'physical', marker: p.at };
  return { kind: 'map', map, highlight: [p.id], layer: 'physical' };
}

// ---------------------------------------------------------------- questions

export function questionFor(cardId: string, card: CardState | undefined): QuizStep {
  const box = card?.box ?? 0;
  const [kind, id] = cardId.split(/:(.+)/);
  switch (kind) {
    case 'ic': return stateCapitalQ(cardId, id, box);
    case 'im': return stateMapQ(cardId, id, box);
    case 'sn': return stateNeighbourQ(cardId, id, box);
    case 'nb': return neighbourQ(cardId, id, box);
    case 'ct': return continentQ(cardId, id, box);
    case 'oc': return oceanQ(cardId, id, box);
    case 'wc': return worldCapitalQ(cardId, id, box);
    case 'wf': return flagQ(cardId, id, box);
    case 'wm': return worldMapQ(cardId, id, box);
    case 'ip': return physicalQ(cardId, IND_PHYS[id], INDIA_PHYSICAL, 'india', box);
    case 'wp': return physicalQ(cardId, WORLD_PHYS[id], WORLD_PHYSICAL, 'world', box);
    case 'ir': return resourceQ(cardId, IND_RES[id], INDIA_RESOURCES, 'india', box);
    case 'wr': return resourceQ(cardId, WORLD_RES[id], WORLD_RESOURCES, 'world', box);
    case 'il': return landmarkQ(cardId, IND_LM[id], 'india', box);
    case 'wl': return landmarkQ(cardId, WORLD_LM[id], 'world', box);
    case 'po': return planetOrderQ(cardId, id);
    case 'cg': return compassQ(cardId, id === '8');
    case 'f': return factQ(cardId, FACT_BY_ID[id], box);
    default: throw new Error(`Unknown card ${cardId}`);
  }
}

function stateCapitalQ(card: string, id: string, box: number): McqStep {
  const s = STATE_BY_ID[id];
  const explain = `${s.capital} is the capital of ${s.name}.${s.capitalNote ? ' ' + s.capitalNote : ''}`;
  const reverse = box >= 2 && Math.random() < 0.5;
  if (reverse) {
    const sharing = STATES.filter((x) => x.capital === s.capital).map((x) => x.id);
    return {
      type: 'mcq', card, prompt: `${s.capital} is the capital of which ${s.type === 'ut' ? 'place' : 'state'}?`,
      say: `${speakCapital(id)} is the capital of which ${s.type === 'ut' ? 'place' : 'state'}?`,
      visual: { kind: 'emoji', value: '⭐' },
      options: stateOptions(id, { avoid: sharing, n: n(box), region: box >= 3 ? s.region : undefined }),
      answer: id, explain,
    };
  }
  const others = sample(STATE_CAPITALS.filter((c) => c !== s.capital), n(box) - 1);
  return {
    type: 'mcq', card, prompt: `What is the capital of ${s.name}?`, say: `What is the capital of ${s.name}?`,
    visual: stateMapVisual(id),
    options: shuffle([s.capital, ...others]).map((c) => ({ id: c, label: c })),
    answer: s.capital, explain,
  };
}

function stateMapQ(card: string, id: string, box: number): QuizStep {
  const s = STATE_BY_ID[id];
  const explain = `This is ${s.name}. ${s.funFact}`;
  if (box < 2) {
    return {
      type: 'mcq', card, prompt: 'Which state or territory is coloured on the map?', say: 'Which state is coloured on the map?',
      visual: stateMapVisual(id), options: stateOptions(id, { n: n(box) }), answer: id, explain,
    };
  }
  return {
    type: 'mapFind', card, prompt: `Find ${s.name} on the map`, say: `Can you find ${s.name}? Tap it on the map.`,
    map: 'india', layer: 'political', target: id, targetKind: 'state', explain,
  };
}

function stateNeighbourQ(card: string, id: string, box: number): McqStep {
  const s = STATE_BY_ID[id];
  const nbs = mapsIfLoaded()?.stateNeighbors[id] ?? [];
  if (!nbs.length) return stateMapQ(card, id, 0) as McqStep;
  const answer = pick(nbs);
  const wrong = sample(STATES.filter((x) => !nbs.includes(x.id) && x.id !== id).map((x) => x.id), n(box) - 1);
  return {
    type: 'mcq', card, prompt: `Which of these shares a border with ${s.name}?`, say: `Which of these shares a border with ${s.name}?`,
    visual: stateMapVisual(id),
    options: shuffle([answer, ...wrong]).map((x) => ({ id: x, label: STATE_BY_ID[x].name })), answer,
    explain: `${s.name} touches ${nbs.map((x) => STATE_BY_ID[x]?.name).join(', ')}.`,
  };
}

function neighbourQ(card: string, id: string, box: number): QuizStep {
  const c = COUNTRY_BY_ID[id];
  const focus = ['IND', ...INDIA_NEIGHBOURS, 'LKA'];
  const explain = `${c.name} is one of India's neighbours. Its capital is ${c.capital}.`;
  if (box < 2) {
    return {
      type: 'mcq', card, prompt: 'Which neighbour of India is coloured?', say: 'Which neighbour of India is coloured on the map?',
      visual: { kind: 'map', map: 'world', highlight: [id], focus, soft: ['IND'] },
      options: shuffle([id, ...sample(INDIA_NEIGHBOURS.filter((x) => x !== id), n(box) - 1)]).map((x) => ({ id: x, label: COUNTRY_BY_ID[x].name, flag: flagOf(COUNTRY_BY_ID[x].iso2) })),
      answer: id, explain,
    };
  }
  return { type: 'mapFind', card, prompt: `Find ${c.name}`, say: `Find ${c.name}, India's neighbour.`, map: 'world', layer: 'political', target: id, targetKind: 'country', focus, explain };
}

function continentQ(card: string, id: string, box: number): QuizStep {
  const c = CONTINENTS.find((x) => x.id === id)!;
  if (box < 2) {
    return {
      type: 'mcq', card, prompt: 'Which continent is coloured?', say: 'Which continent is coloured?',
      visual: { kind: 'map', map: 'world', highlight: [id], layer: 'continents' },
      options: shuffle([c, ...sample(CONTINENTS.filter((x) => x.id !== id), n(box) - 1)]).map((x) => ({ id: x.id, label: x.id, emoji: x.emoji })),
      answer: id, explain: c.fact,
    };
  }
  return { type: 'mapFind', card, prompt: `Tap on ${id}`, say: `Tap on ${id}.`, map: 'world', layer: 'continents', target: id, targetKind: 'continent', explain: c.fact };
}

function oceanQ(card: string, id: string, box: number): QuizStep {
  const o = OCEAN_BY_ID[id];
  if (box < 2) {
    return {
      type: 'mcq', card, prompt: 'Which ocean has the marker?', say: 'Which ocean has the marker on it?',
      visual: { kind: 'map', map: 'world', highlight: [], layer: 'continents', marker: o.points[0] },
      options: shuffle([o, ...sample(OCEANS.filter((x) => x.id !== id), n(box) - 1)]).map((x) => ({ id: x.id, label: x.name, emoji: '🌊' })),
      answer: id, explain: o.fact,
    };
  }
  return { type: 'mapFind', card, prompt: `Tap on the ${o.name}`, say: `Tap on the ${o.name}.`, map: 'world', layer: 'continents', target: id, targetKind: 'ocean', explain: o.fact };
}

function worldCapitalQ(card: string, id: string, box: number): McqStep {
  const c = COUNTRY_BY_ID[id];
  const explain = `${c.capital} is the capital of ${c.name}.${c.capitalNote ? ' ' + c.capitalNote : ''}`;
  if (box >= 2 && Math.random() < 0.5) {
    return {
      type: 'mcq', card, prompt: `${c.capital} is the capital of which country?`, say: `${c.capital} is the capital of which country?`,
      visual: { kind: 'emoji', value: '🏙️' },
      options: countryOptions(id, { n: n(box), sameContinent: box >= 3, withFlag: true }), answer: id, explain,
    };
  }
  const pool = COUNTRIES.filter((x) => x.id !== id && !x.noCapitalQuiz && (box >= 3 ? x.continent === c.continent : x.tier <= Math.max(2, c.tier)));
  const capitals = sample(pool.map((x) => x.capital).filter((x) => x !== c.capital), n(box) - 1);
  return {
    type: 'mcq', card, prompt: `What is the capital of ${c.name}?`, say: `What is the capital of ${c.name}?`,
    visual: { kind: 'flag', iso2: c.iso2 },
    options: shuffle([c.capital, ...capitals]).map((x) => ({ id: x, label: x })), answer: c.capital, explain,
  };
}

// Flags that are identical or nearly so must never appear together as options.
const LOOKALIKE_FLAGS: Record<string, string[]> = {
  IDN: ['MCO', 'POL'], MCO: ['IDN', 'POL'], POL: ['IDN', 'MCO'], TCD: ['ROU', 'AND', 'MDA'], ROU: ['TCD', 'AND', 'MDA'],
  AND: ['TCD', 'ROU', 'MDA'], MDA: ['TCD', 'ROU', 'AND'], IRL: ['CIV', 'ITA'], CIV: ['IRL', 'ITA'], ITA: ['IRL', 'CIV', 'MEX'],
  MEX: ['ITA'], AUS: ['NZL'], NZL: ['AUS'], NLD: ['LUX'], LUX: ['NLD'], SEN: ['MLI'], MLI: ['SEN', 'GIN'], GIN: ['MLI'],
  VEN: ['ECU', 'COL'], ECU: ['COL', 'VEN'], COL: ['ECU', 'VEN'], SVN: ['SVK', 'RUS'], SVK: ['SVN', 'RUS'], RUS: ['SVN', 'SVK'],
  NOR: ['ISL'], ISL: ['NOR'], QAT: ['BHR'], BHR: ['QAT'], HTI: ['LIE'], LIE: ['HTI'],
};

function flagQ(card: string, id: string, box: number): McqStep {
  const c = COUNTRY_BY_ID[id];
  const avoid = LOOKALIKE_FLAGS[id] ?? [];
  const explain = `That is the flag of ${c.name}.`;
  if (box >= 2 && Math.random() < 0.5) {
    const opts = countryOptions(id, { avoid, n: n(box), sameContinent: box >= 3, withFlag: true });
    return {
      type: 'mcq', card, prompt: `Which is the flag of ${c.name}?`, say: `Which is the flag of ${c.name}?`,
      options: opts.map((o) => ({ id: o.id, label: '', flag: o.flag })), answer: id, explain,
    };
  }
  return {
    type: 'mcq', card, prompt: 'Which country has this flag?', say: 'Which country has this flag?',
    visual: { kind: 'flag', iso2: c.iso2 },
    options: countryOptions(id, { avoid, n: n(box), sameContinent: box >= 3, tierMax: box >= 3 ? 3 : Math.max(2, c.tier) }), answer: id, explain,
  };
}

function worldMapQ(card: string, id: string, box: number): QuizStep {
  const c = COUNTRY_BY_ID[id];
  const explain = `This is ${c.name}, in ${c.continent}.${c.fact ? ' ' + c.fact : ''}`;
  const sameCont = COUNTRIES.filter((x) => x.continent === c.continent).map((x) => x.id);
  if (box < 2) {
    return {
      type: 'mcq', card, prompt: 'Which country is coloured?', say: 'Which country is coloured on the map?',
      visual: countryMapVisual(id),
      options: countryOptions(id, { n: n(box), sameContinent: true, withFlag: true, tierMax: Math.max(2, c.tier) }), answer: id, explain,
    };
  }
  return { type: 'mapFind', card, prompt: `Find ${c.name}`, say: `Find ${c.name} on the map.`, map: 'world', layer: 'political', target: id, targetKind: 'country', focus: sameCont, explain };
}

function physicalQ(card: string, p: PhysicalFeature, all: PhysicalFeature[], map: MapKind, box: number): McqStep {
  const sameKind = all.filter((x) => x.id !== p.id && (x.kind === p.kind || (p.kind !== 'river' && p.kind !== 'sea' && x.kind !== 'river' && x.kind !== 'sea')));
  const word = p.kind === 'river' ? 'river' : p.kind === 'sea' ? 'sea or ocean' : p.kind === 'mountains' ? 'mountain range' : 'place';
  return {
    type: 'mcq', card, prompt: `What is the name of this ${word}?`, say: `What is the name of this ${word}?`,
    visual: physicalVisual(p, map),
    options: shuffle([p, ...sample(sameKind, n(box) - 1)]).map((x) => ({ id: x.id, label: x.name, emoji: x.emoji })),
    answer: p.id, explain: p.fact,
  };
}

function resourceQ(card: string, r: ResourceLink, all: ResourceLink[], map: MapKind, box: number): QuizStep {
  const avoid = r.alsoOk ?? [];
  const isIndia = map === 'india';
  const name = (x: string) => (isIndia ? STATE_BY_ID[x].name : COUNTRY_BY_ID[x].name);
  const roll = Math.random();
  if (box >= 2 && roll < 0.4) {
    return {
      type: 'mapFind', card, prompt: `Tap the ${isIndia ? 'state' : 'country'} famous for ${r.resource.toLowerCase()} ${r.emoji}`,
      say: `Tap the ${isIndia ? 'state' : 'country'} famous for ${r.resource}.`, map, layer: 'political', target: r.answer, accept: avoid,
      targetKind: isIndia ? 'state' : 'country', explain: r.fact,
    };
  }
  if (box >= 1 && roll < 0.7) {
    // reverse: what is this place famous for?
    const wrong = sample(all.filter((x) => x.answer !== r.answer && !(x.alsoOk ?? []).includes(r.answer)), n(box) - 1);
    return {
      type: 'mcq', card, prompt: `${name(r.answer)} is famous for...`, say: `${name(r.answer)} is famous for what?`,
      visual: isIndia ? stateMapVisual(r.answer) : countryMapVisual(r.answer),
      options: shuffle([r, ...wrong]).map((x) => ({ id: x.id, label: x.resource, emoji: x.emoji })), answer: r.id, explain: r.fact,
    };
  }
  return {
    type: 'mcq', card, prompt: `Which ${isIndia ? 'state' : 'country'} is famous for ${r.resource.toLowerCase()}?`,
    say: `Which ${isIndia ? 'state' : 'country'} is famous for ${r.resource}?`, visual: { kind: 'emoji', value: r.emoji },
    options: isIndia ? stateOptions(r.answer, { avoid, n: n(box) }) : countryOptions(r.answer, { avoid, n: n(box), withFlag: true, tierMax: 2 }),
    answer: r.answer, explain: r.fact,
  };
}

function landmarkQ(card: string, l: Landmark, map: MapKind, box: number): QuizStep {
  const isIndia = map === 'india';
  if (box >= 2 && Math.random() < 0.4) {
    return {
      type: 'mapFind', card, prompt: `Where is the ${l.name}? Tap the ${isIndia ? 'state' : 'country'} ${l.emoji}`,
      say: `Where is the ${l.name}? Tap the ${isIndia ? 'state' : 'country'}.`, map, layer: 'political', target: l.where,
      targetKind: isIndia ? 'state' : 'country', explain: l.fact,
    };
  }
  return {
    type: 'mcq', card, prompt: `In which ${isIndia ? 'state' : 'country'} is the ${l.name}?`,
    say: `In which ${isIndia ? 'state' : 'country'} is the ${l.name}?`, visual: { kind: 'emoji', value: l.emoji },
    options: isIndia ? stateOptions(l.where, { n: n(box) }) : countryOptions(l.where, { n: n(box), withFlag: true, tierMax: 2 }),
    answer: l.where, explain: l.fact,
  };
}

function planetOrderQ(card: string, which: string): OrderStep {
  if (which === 'size') {
    const four = sample(PLANETS, 4).sort((a, b) => a.diameterKm - b.diameterKm);
    return {
      type: 'order', card, prompt: 'Tap the planets from SMALLEST to BIGGEST', say: 'Tap the planets from smallest to biggest.',
      items: four.map((p) => ({ id: p.id, label: p.name })),
      explain: `From smallest to biggest: ${four.map((p) => p.name).join(', ')}. Jupiter is the biggest and Mercury the smallest.`,
    };
  }
  const list = which === 'inner' ? PLANETS.slice(0, 4) : PLANETS;
  return {
    type: 'order', card, prompt: `Tap the ${which === 'inner' ? 'rocky ' : ''}planets in order, starting nearest the Sun`,
    say: `Tap the planets in order, starting with the one nearest the Sun.`,
    items: list.map((p) => ({ id: p.id, label: p.name })),
    explain: `The order is ${list.map((p) => p.name).join(', ')}.`,
  };
}

const PLACES = ['🏫 School', '🌳 Tree', '🏥 Hospital', '🛝 Park', '🏪 Shop', '🐄 Farm', '⛲ Fountain', '🚉 Station', '🏊 Pool', '🌻 Garden', '🏰 Castle', '⛪ Temple'];
const DIRS4 = ['North', 'East', 'South', 'West'];
const DIRS8 = ['North', 'North-East', 'East', 'South-East', 'South', 'South-West', 'West', 'North-West'];
// 3x3 grid index for each direction from the centre (index 4)
const DIR_CELL: Record<string, number> = { North: 1, 'North-East': 2, East: 5, 'South-East': 8, South: 7, 'South-West': 6, West: 3, 'North-West': 0 };

function compassQ(card: string, eight: boolean): McqStep {
  const dirs = eight ? DIRS8 : DIRS4;
  const places = sample(PLACES, dirs.length);
  const cells: (string | null)[] = Array(9).fill(null);
  cells[4] = '🏠 Home';
  dirs.forEach((d, i) => (cells[DIR_CELL[d]] = places[i]));
  const i = Math.floor(Math.random() * dirs.length);
  const dir = dirs[i];
  const place = places[i];
  const placeName = place.split(' ').slice(1).join(' ');
  if (Math.random() < 0.5) {
    return {
      type: 'mcq', card, prompt: `What is ${dir.toUpperCase()} of Home?`, say: `What is ${dir} of home?`,
      visual: { kind: 'grid', cells, eight },
      options: shuffle([place, ...sample(places.filter((p) => p !== place), 3)]).map((p) => ({ id: p, label: p.split(' ').slice(1).join(' '), emoji: p.split(' ')[0] })),
      answer: place, explain: `The ${placeName} is ${dir} of Home.`,
    };
  }
  return {
    type: 'mcq', card, prompt: `Which direction is the ${placeName} from Home?`, say: `Which direction is the ${placeName} from home?`,
    visual: { kind: 'grid', cells, eight },
    options: shuffle([dir, ...sample(dirs.filter((d) => d !== dir), 3)]).map((d) => ({ id: d, label: d })),
    answer: dir, explain: `The ${placeName} is ${dir} of Home.`,
  };
}

function factQ(card: string, f: Fact, box: number): McqStep {
  const wrong = sample(f.wrong, box >= 2 ? 3 : 2);
  return {
    type: 'mcq', card, prompt: f.q, say: f.q, visual: factVisual(f),
    options: shuffle([f.a, ...wrong]).map((x) => ({ id: x, label: x })), answer: f.a, explain: f.explain,
  };
}

// ---------------------------------------------------------------- sessions

export interface SessionPlan {
  steps: Step[];
  newCards: string[];
}

/** Turn a list of card ids into teach steps (for new groups) followed by mixed questions. */
export function buildSteps(cardIds: string[], cards: Record<string, CardState>): Step[] {
  const fresh = cardIds.filter((c) => !cards[c]);
  const teachGroups: string[] = [];
  const teaches: TeachStep[] = [];
  for (const c of fresh) {
    const g = CARDS[c].group;
    if (!teachGroups.includes(g)) {
      teachGroups.push(g);
      const t = teachFor(c);
      if (!teaches.some((x) => x.title === t.title)) teaches.push(t);
    }
  }
  const old = shuffle(cardIds.filter((c) => cards[c]));
  const freshShuffled = shuffle(fresh);
  // Interleave so a just-taught card is not asked immediately after its teach screen.
  const quiz: string[] = [];
  while (old.length || freshShuffled.length) {
    if (old.length) quiz.push(old.shift()!);
    if (freshShuffled.length) quiz.push(freshShuffled.shift()!);
  }
  const steps: Step[] = [];
  // Teach in small batches of up to 3, each followed by a few questions.
  let qi = 0;
  for (let t = 0; t < teaches.length; t += 3) {
    steps.push(...teaches.slice(t, t + 3));
    const take = Math.ceil(quiz.length / Math.ceil(teaches.length / 3));
    for (let k = 0; k < take && qi < quiz.length; k++, qi++) steps.push(questionFor(quiz[qi], cards[quiz[qi]]));
  }
  for (; qi < quiz.length; qi++) steps.push(questionFor(quiz[qi], cards[quiz[qi]]));
  return steps;
}

/** Expand a list of new cards so a group's cards come in together (capital + map of the same state). */
function takeNew(pool: string[], cards: Record<string, CardState>, limit: number, taken: Set<string>): string[] {
  const out: string[] = [];
  for (const c of pool) {
    if (out.length >= limit) break;
    if (cards[c] || taken.has(c)) continue;
    const group = CARDS[c].group;
    const siblings = pool.filter((x) => CARDS[x].group === group && !cards[x] && !taken.has(x));
    if (out.length && out.length + siblings.length > limit) continue;
    siblings.forEach((x) => {
      out.push(x);
      taken.add(x);
    });
  }
  return out;
}

/** Re-ask some of today's new cards at the end, as extra practice (only the first answer counts). */
function withRepeats(steps: Step[], newCards: string[], room: number): Step[] {
  if (room <= 0 || !newCards.length) return steps;
  const again = shuffle(newCards).slice(0, room);
  return [...steps, ...again.map((c) => questionFor(c, undefined))];
}

export function dailyMission(
  cards: Record<string, CardState>,
  settings: { newPerDay: number; sessionLength: number; focus: 'path' | 'india-first' },
  newAlreadyToday: number,
): SessionPlan {
  const today = dayNumber();
  const length = settings.sessionLength;
  const newBudget = Math.max(0, Math.min(settings.newPerDay - newAlreadyToday, Math.ceil(length / 2)));
  const due = Object.keys(cards)
    .filter((c) => CARDS[c] && isDue(cards[c], today))
    .sort((a, b) => cards[a].due - cards[b].due || cards[a].box - cards[b].box);
  const pathCards = orderedUnits(settings.focus).flatMap((u) => u.cards);
  const newCards = takeNew(pathCards, cards, newBudget, new Set());
  let chosen = [...due.slice(0, Math.max(length - newCards.length, 0)), ...newCards];
  if (chosen.length < length) {
    // Top up with the shakiest cards seen so far - never with extra new facts beyond today's budget.
    const extra = Object.keys(cards)
      .filter((c) => CARDS[c] && !chosen.includes(c))
      .sort((a, b) => cards[a].box - cards[b].box || cards[a].last - cards[b].last)
      .slice(0, length - chosen.length);
    chosen = [...chosen, ...extra];
  }
  return { steps: withRepeats(buildSteps(chosen, cards), newCards, length - chosen.length), newCards };
}

/** A practice round from a pool of cards: due cards first, then a few new ones, then shaky ones. */
export function poolSession(pool: string[], cards: Record<string, CardState>, length: number): SessionPlan {
  const today = dayNumber();
  const due = pool.filter((c) => isDue(cards[c], today));
  const learning = shuffle(pool.filter((c) => cards[c] && !due.includes(c))).sort((a, b) => cards[a].box - cards[b].box);
  const newCards = takeNew(pool, cards, Math.max(3, Math.min(6, length - due.length)), new Set());
  const chosen = [...due.slice(0, length - Math.min(newCards.length, 4)), ...newCards];
  for (const c of learning) {
    if (chosen.length >= length) break;
    if (!chosen.includes(c)) chosen.push(c);
  }
  return { steps: withRepeats(buildSteps(chosen, cards), newCards, length - chosen.length), newCards };
}

// ---------------------------------------------------------------- stats, badges, passport

export function deckStats(cardIds: string[], cards: Record<string, CardState>) {
  let fresh = 0, learning = 0, known = 0, mastered = 0;
  for (const c of cardIds) {
    const b = cards[c]?.box ?? 0;
    if (b === 0) fresh++;
    else if (b >= MASTERED_BOX) mastered++;
    else if (b >= 2) known++;
    else learning++;
  }
  return { total: cardIds.length, fresh, learning, known, mastered };
}

const knows = (cards: Record<string, CardState>, ids: string[], box = 3) => ids.length > 0 && ids.every((c) => (cards[c]?.box ?? 0) >= box);

export function stampedCountries(cards: Record<string, CardState>): string[] {
  return COUNTRIES.filter((c) => knows(cards, countryCards(c.id))).map((c) => c.id);
}

export interface Badge {
  id: string;
  emoji: string;
  title: string;
  how: string;
  check: (s: { cards: Record<string, CardState>; stars: number; streak: number; missions: number }) => boolean;
}

export const BADGES: Badge[] = [
  { id: 'first-mission', emoji: '🎒', title: 'First Adventure', how: 'Finish your first daily adventure', check: (s) => s.missions >= 1 },
  { id: 'streak-3', emoji: '🔥', title: '3-Day Streak', how: 'Learn 3 days in a row', check: (s) => s.streak >= 3 },
  { id: 'streak-7', emoji: '🌟', title: 'Week Explorer', how: 'Learn 7 days in a row', check: (s) => s.streak >= 7 },
  { id: 'streak-30', emoji: '👑', title: 'Unstoppable', how: 'Learn 30 days in a row', check: (s) => s.streak >= 30 },
  { id: 'stars-100', emoji: '⭐', title: '100 Stars', how: 'Collect 100 stars', check: (s) => s.stars >= 100 },
  { id: 'stars-500', emoji: '🌠', title: '500 Stars', how: 'Collect 500 stars', check: (s) => s.stars >= 500 },
  { id: 'stars-2000', emoji: '🌌', title: '2000 Stars', how: 'Collect 2000 stars', check: (s) => s.stars >= 2000 },
  ...REGIONS.map((r) => ({
    id: `region-${r.id}`, emoji: r.emoji, title: `${r.name} Expert`, how: `Know every capital and map spot in ${r.name}`,
    check: (s: { cards: Record<string, CardState> }) => knows(s.cards, stateCards(STATES.filter((x) => x.region === r.id).map((x) => x.id))),
  })),
  { id: 'all-india', emoji: '🇮🇳', title: 'All of India!', how: 'Know all 36 states and UTs, capitals and map spots', check: (s) => knows(s.cards, stateCards(STATES.map((x) => x.id))) },
  { id: 'continents', emoji: '🌍', title: 'Globe Trotter', how: 'Know all 7 continents and 5 oceans', check: (s) => knows(s.cards, cardsOf('continents')) },
  { id: 'planets', emoji: '🪐', title: 'Space Cadet', how: 'Know the order of all 8 planets', check: (s) => knows(s.cards, ['po:inner', 'po:all']) },
  { id: 'passport-10', emoji: '🛂', title: '10 Passport Stamps', how: 'Know 10 countries (capital, flag and map)', check: (s) => stampedCountries(s.cards).length >= 10 },
  { id: 'passport-50', emoji: '✈️', title: '50 Passport Stamps', how: 'Know 50 countries', check: (s) => stampedCountries(s.cards).length >= 50 },
  { id: 'passport-195', emoji: '🌐', title: 'Every Country', how: 'Know every country', check: (s) => stampedCountries(s.cards).length >= COUNTRIES.length },
  { id: 'rivers', emoji: '🌊', title: 'River Rider', how: 'Know India\'s rivers and mountains', check: (s) => knows(s.cards, cardsOf('india-physical')) },
  { id: 'champion-10', emoji: '🏆', title: 'Junior Champion', how: 'Know 10 champion questions', check: (s) => cardsOf('champion').filter((c) => (s.cards[c]?.box ?? 0) >= 3).length >= 10 },
  { id: 'champion-all', emoji: '🥇', title: 'Geo Champion', how: 'Know every champion question', check: (s) => knows(s.cards, cardsOf('champion')) },
];

export const STICKERS = ['🦁', '🐯', '🦏', '🐘', '🦚', '🐪', '🐼', '🐨', '🦘', '🐧', '🦒', '🦓', '🐬', '🐢', '🦜', '🦩', '🐙', '🦋', '🐝', '🦖', '🦕', '🐳', '🦭', '🦦', '🦥', '🐸', '🦔', '🐿️', '🦉', '🦅', '🗼', '🗽', '🕌', '🛕', '🏯', '🗻', '🌋', '🏝️', '🏜️', '🌈', '🚀', '🛸', '🪐', '🌙', '☄️', '🌏', '🧭', '⛵', '🚂', '🎈'];

export function nextSticker(owned: string[]): string {
  const left = STICKERS.filter((s) => !owned.includes(s));
  return pick(left.length ? left : STICKERS);
}

export function totalCards(): number {
  return Object.keys(CARDS).length;
}
