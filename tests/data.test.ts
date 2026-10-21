import fs from 'node:fs';
import path from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';
import { COUNTRIES, CONTINENTS } from '../src/data/countries';
import { INDIA_LANDMARKS, INDIA_PHYSICAL, INDIA_RESOURCES, STATES } from '../src/data/india';
import { CHAMPION_FACTS, EARTH_FACTS, MY_WORLD_FACTS, SKILL_FACTS, SPACE_FACTS } from '../src/data/facts';
import { INDIA_AREA_IDS, INDIA_RIVER_IDS, WORLD_AREA_IDS, WORLD_LANDMARKS, WORLD_RESOURCES, WORLD_RIVER_IDS } from '../src/data/world';
import { CARDS, DECKS, UNITS, buildSteps, dailyMission, poolSession, questionFor, teachFor } from '../src/lib/curriculum';
import { loadMaps, type MapData } from '../src/lib/mapdata';
import { review } from '../src/lib/srs';

const root = path.resolve(__dirname, '..');
let maps: MapData;

beforeAll(async () => {
  // Serve public/data from disk instead of the network.
  globalThis.fetch = (async (url: string) => {
    const file = path.join(root, 'public', String(url).replace(/^.*?data\//, 'data/'));
    return { ok: true, json: async () => JSON.parse(fs.readFileSync(file, 'utf8')) };
  }) as unknown as typeof fetch;
  maps = await loadMaps();
});

describe('map data', () => {
  it('has exactly the 36 states and union territories', () => {
    const ids = maps.states.map((f) => f.properties.id).sort();
    expect(ids).toEqual(STATES.map((s) => s.id).sort());
    expect(STATES.filter((s) => s.type === 'state')).toHaveLength(28);
    expect(STATES.filter((s) => s.type === 'ut')).toHaveLength(8);
  });

  it('has a map shape for every country in the content', () => {
    const ids = new Set(maps.countries.map((f) => f.properties.id));
    const missing = COUNTRIES.filter((c) => !ids.has(c.id)).map((c) => c.id);
    expect(missing).toEqual([]);
  });

  it('has all six populated continents plus Antarctica', () => {
    const conts = maps.continents.map((f) => f.properties.id).sort();
    expect(conts).toEqual(CONTINENTS.map((c) => c.id).sort());
  });

  it('has every river and physical area the app refers to', () => {
    const rivers = new Set(maps.rivers.map((f) => f.properties.id));
    const areas = new Set(maps.regions.map((f) => f.properties.id));
    for (const r of [...INDIA_RIVER_IDS, ...WORLD_RIVER_IDS]) expect(rivers.has(r), r).toBe(true);
    for (const a of [...INDIA_AREA_IDS, ...WORLD_AREA_IDS]) expect(areas.has(a), a).toBe(true);
    for (const p of INDIA_PHYSICAL) {
      if (p.kind === 'river') expect(rivers.has(p.id), p.id).toBe(true);
      else if (!p.line && p.kind !== 'sea') expect(areas.has(p.id), p.id).toBe(true);
    }
  });

  it('knows which states touch each other', () => {
    expect(maps.stateNeighbors.KL.sort()).toEqual(['KA', 'PY', 'TN']);
    expect(maps.stateNeighbors.UP).toEqual(expect.arrayContaining(['UK', 'HP', 'HR', 'DL', 'RJ', 'MP', 'CG', 'JH', 'BR']));
    expect(maps.stateNeighbors.SK.sort()).toEqual(['WB']);
  });
});

describe('content', () => {
  it('has 193 UN members + Vatican, Palestine and Taiwan', () => {
    expect(COUNTRIES).toHaveLength(196);
    expect(new Set(COUNTRIES.map((c) => c.id)).size).toBe(196);
    expect(new Set(COUNTRIES.map((c) => c.iso2)).size).toBe(196);
    for (const c of COUNTRIES) expect(c.iso2).toMatch(/^[A-Z]{2}$/);
  });

  it('uses current capital names', () => {
    const cap = (id: string) => STATES.find((s) => s.id === id)!.capital;
    expect(cap('AN')).toBe('Sri Vijaya Puram');
    expect(cap('AP')).toBe('Amaravati');
    expect(cap('LA')).toBe('Leh');
    expect(COUNTRIES.find((c) => c.id === 'KAZ')!.capital).toBe('Astana');
  });

  it('never lists the right answer among the wrong ones', () => {
    for (const f of [...SPACE_FACTS, ...SKILL_FACTS, ...EARTH_FACTS, ...MY_WORLD_FACTS, ...CHAMPION_FACTS]) {
      expect(f.wrong, f.id).not.toContain(f.a);
      expect(new Set(f.wrong).size, f.id).toBe(f.wrong.length);
      expect(f.wrong.length, f.id).toBeGreaterThanOrEqual(3);
    }
    for (const r of [...INDIA_RESOURCES, ...WORLD_RESOURCES]) expect(r.alsoOk ?? [], r.id).not.toContain(r.answer);
  });

  it('points landmarks and resources at real places', () => {
    const states = new Set(STATES.map((s) => s.id));
    const countries = new Set(COUNTRIES.map((c) => c.id));
    for (const l of INDIA_LANDMARKS) expect(states.has(l.where), l.id).toBe(true);
    for (const r of INDIA_RESOURCES) for (const s of [r.answer, ...(r.alsoOk ?? [])]) expect(states.has(s), r.id).toBe(true);
    for (const l of WORLD_LANDMARKS) expect(countries.has(l.where), l.id).toBe(true);
    for (const r of WORLD_RESOURCES) for (const s of [r.answer, ...(r.alsoOk ?? [])]) expect(countries.has(s), r.id).toBe(true);
  });
});

describe('learning engine', () => {
  it('every unit and deck only uses real cards', () => {
    for (const u of UNITS) for (const c of u.cards) expect(CARDS[c], `${u.id} ${c}`).toBeDefined();
    for (const d of DECKS) for (const c of d.cards) expect(CARDS[c], `${d.id} ${c}`).toBeDefined();
  });

  it('every India state is on the Adventure Path', () => {
    const path = new Set(UNITS.flatMap((u) => u.cards));
    for (const s of STATES) {
      expect(path.has(`ic:${s.id}`), s.id).toBe(true);
      expect(path.has(`im:${s.id}`), s.id).toBe(true);
    }
  });

  it('builds a valid question for every card at every level', () => {
    for (const id of Object.keys(CARDS)) {
      expect(teachFor(id).title, id).toBeTruthy();
      for (const box of [0, 1, 2, 3, 5]) {
        for (let rep = 0; rep < 4; rep++) {
          const card = box ? { box, due: 0, seen: box, right: box, wrong: 0, last: 0 } : undefined;
          const q = questionFor(id, card);
          expect(q.prompt, id).toBeTruthy();
          if (q.type === 'mcq') {
            const ids = q.options.map((o) => o.id);
            expect(ids, `${id} box ${box}`).toContain(q.answer);
            expect(new Set(ids).size, `${id} duplicate options`).toBe(ids.length);
            expect(ids.length, id).toBeGreaterThanOrEqual(3);
            const labels = q.options.map((o) => o.label || o.flag);
            expect(new Set(labels).size, `${id} duplicate labels ${labels}`).toBe(labels.length);
          } else if (q.type === 'mapFind') {
            expect(q.target, id).toBeTruthy();
          } else {
            expect(q.items.length, id).toBeGreaterThanOrEqual(4);
          }
        }
      }
    }
  });

  it('never offers two look-alike flags in the same question', () => {
    for (let i = 0; i < 60; i++) {
      for (const [card, twin] of [['wf:IDN', 'MCO'], ['wf:MCO', 'IDN'], ['wf:TCD', 'ROU'], ['wf:ROU', 'TCD']]) {
        const q = questionFor(card, { box: 2 + (i % 3), due: 0, seen: 3, right: 3, wrong: 0, last: 0 });
        if (q.type === 'mcq') expect(q.options.map((o) => o.id), card).not.toContain(twin);
      }
    }
  });

  it('a first daily adventure teaches before it quizzes and respects the new-fact budget', () => {
    const plan = dailyMission({}, { newPerDay: 6, sessionLength: 12, focus: 'path' }, 0);
    expect(plan.newCards.length).toBeGreaterThan(0);
    expect(plan.newCards.length).toBeLessThanOrEqual(6);
    expect(plan.steps[0].type).toBe('teach');
    const quizzes = plan.steps.filter((s) => s.type !== 'teach');
    expect(quizzes.length).toBe(12);
  });

  it('a second adventure on the same day adds no new facts', () => {
    const plan = dailyMission({}, { newPerDay: 6, sessionLength: 12, focus: 'path' }, 6);
    expect(plan.newCards).toEqual([]);
  });

  it('keeps a state\'s capital and map facts together when introducing them', () => {
    const plan = poolSession(['ic:KL', 'im:KL', 'ic:TN', 'im:TN'], {}, 10);
    expect(plan.newCards.sort()).toEqual(['ic:KL', 'ic:TN', 'im:KL', 'im:TN']);
    expect(plan.steps.filter((s) => s.type === 'teach')).toHaveLength(2);
  });

  it('reviews due cards from earlier days', () => {
    const old = new Date(Date.now() - 3 * 86400000);
    const cards = { 'ic:KL': review(undefined, true, old) };
    const steps = buildSteps(['ic:KL'], cards);
    expect(steps).toHaveLength(1);
    expect(steps[0].type).not.toBe('teach');
  });
});

describe('spaced repetition', () => {
  it('spaces correct answers further apart and resets on a mistake', () => {
    let c = review(undefined, true);
    expect(c.box).toBe(1);
    c = review(c, true);
    expect(c.box).toBe(2);
    c = review(c, true);
    expect(c.box).toBe(3);
    const due3 = c.due;
    c = review(c, false);
    expect(c.box).toBe(1);
    expect(c.due).toBeLessThan(due3);
  });
});
