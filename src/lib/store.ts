// App state, saved in localStorage on this device.
// Safari can clear website storage after ~7 days without a visit, so the parent area offers
// "Add to Home Screen" guidance (home-screen apps are exempt) and a backup file export.
import { useSyncExternalStore } from 'react';
import { DEFAULT_PASSPORT } from '../data/countries';
import { review, type CardState } from './srs';
import { configureSpeech } from './speech';
import { configureSound } from './sound';
import { dayKey } from './util';

export type Focus = 'path' | 'india-first';

export interface Settings {
  childName: string;
  avatar: string;
  voice: boolean;
  rate: number;
  voiceURI?: string;
  sounds: boolean;
  newPerDay: number;
  sessionLength: number;
  focus: Focus;
  studyDaysPerWeek: number;
}

export interface DayLog {
  q: number;
  right: number;
  ms: number;
  mission: boolean;
  newCards: number;
}

export interface AppState {
  version: 1;
  createdAt: number;
  onboarded: boolean;
  settings: Settings;
  cards: Record<string, CardState>;
  stars: number;
  days: Record<string, DayLog>;
  badges: Record<string, number>;
  stickers: string[];
  passport: string[];
}

const KEY = 'geoexplorer.v1';

export const DEFAULT_SETTINGS: Settings = {
  childName: 'Explorer',
  avatar: '🦊',
  voice: true,
  rate: 0.9,
  sounds: true,
  newPerDay: 6,
  sessionLength: 12,
  focus: 'path',
  studyDaysPerWeek: 5,
};

function fresh(): AppState {
  return {
    version: 1,
    createdAt: Date.now(),
    onboarded: false,
    settings: { ...DEFAULT_SETTINGS },
    cards: {},
    stars: 0,
    days: {},
    badges: {},
    stickers: [],
    passport: [...DEFAULT_PASSPORT],
  };
}

function load(): AppState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return fresh();
    const parsed = JSON.parse(raw) as Partial<AppState>;
    return normalize(parsed);
  } catch {
    return fresh();
  }
}

function normalize(parsed: Partial<AppState>): AppState {
  const base = fresh();
  return {
    ...base,
    ...parsed,
    version: 1,
    settings: { ...base.settings, ...(parsed.settings ?? {}) },
    cards: parsed.cards ?? {},
    days: parsed.days ?? {},
    badges: parsed.badges ?? {},
    stickers: parsed.stickers ?? [],
    passport: parsed.passport ?? base.passport,
  };
}

let state: AppState = typeof localStorage !== 'undefined' ? load() : fresh();
const listeners = new Set<() => void>();
applySideEffects(state);

function applySideEffects(s: AppState) {
  configureSpeech({ enabled: s.settings.voice, rate: s.settings.rate, voiceURI: s.settings.voiceURI });
  configureSound(s.settings.sounds);
}

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Storage full or blocked (private mode) - the app keeps working for this session.
  }
}

export function getState(): AppState {
  return state;
}

export function setState(update: (s: AppState) => AppState) {
  state = update(state);
  applySideEffects(state);
  persist();
  listeners.forEach((l) => l());
}

export function useAppState(): AppState {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => state,
    () => state,
  );
}

export function updateSettings(patch: Partial<Settings>) {
  setState((s) => ({ ...s, settings: { ...s.settings, ...patch } }));
}

function today(s: AppState): DayLog {
  return s.days[dayKey()] ?? { q: 0, right: 0, ms: 0, mission: false, newCards: 0 };
}

export function setPassport(passport: string[]) {
  setState((s) => ({ ...s, passport }));
}

export function todayLog(): DayLog {
  return today(state);
}

/** Record an answer: updates the card, stars and today's log. */
export function recordAnswer(cardId: string, correct: boolean, isNew: boolean) {
  setState((s) => {
    const d = today(s);
    return {
      ...s,
      cards: { ...s.cards, [cardId]: review(s.cards[cardId], correct) },
      stars: s.stars + (correct ? 1 : 0),
      days: {
        ...s.days,
        [dayKey()]: { ...d, q: d.q + 1, right: d.right + (correct ? 1 : 0), newCards: d.newCards + (isNew ? 1 : 0) },
      },
    };
  });
}

export function addStudyTime(ms: number) {
  if (ms <= 0) return;
  setState((s) => {
    const d = today(s);
    return { ...s, days: { ...s.days, [dayKey()]: { ...d, ms: d.ms + Math.min(ms, 30 * 60 * 1000) } } };
  });
}

export function markMissionDone() {
  setState((s) => {
    const d = today(s);
    return { ...s, days: { ...s.days, [dayKey()]: { ...d, mission: true } } };
  });
}

export function awardSticker(sticker: string) {
  setState((s) => ({ ...s, stickers: [...s.stickers, sticker] }));
}

export function awardBadges(ids: string[]) {
  if (!ids.length) return;
  setState((s) => {
    const badges = { ...s.badges };
    for (const id of ids) if (!badges[id]) badges[id] = Date.now();
    return { ...s, badges };
  });
}

export function streak(s: AppState = state): number {
  const studied = (k: string) => (s.days[k]?.q ?? 0) >= 5 || s.days[k]?.mission;
  const d = new Date();
  let count = 0;
  if (!studied(dayKey(d))) d.setDate(d.getDate() - 1); // today not done yet - streak still alive
  while (studied(dayKey(d))) {
    count++;
    d.setDate(d.getDate() - 1);
  }
  return count;
}

export function exportBackup(): string {
  return JSON.stringify(state, null, 1);
}

export function importBackup(json: string): boolean {
  try {
    const parsed = JSON.parse(json) as Partial<AppState>;
    if (typeof parsed !== 'object' || !parsed || typeof parsed.cards !== 'object') return false;
    setState(() => normalize(parsed));
    return true;
  } catch {
    return false;
  }
}

export function resetProgress() {
  setState((s) => ({ ...fresh(), onboarded: true, settings: s.settings, passport: s.passport }));
}

export async function requestPersistentStorage() {
  try {
    await navigator.storage?.persist?.();
  } catch {
    // not supported
  }
}
