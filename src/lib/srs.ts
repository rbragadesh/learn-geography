// Leitner-style spaced repetition, tuned for a young child:
// short early intervals, and a wrong answer drops the card back to box 1 (not 0) so it
// returns tomorrow instead of feeling like starting over.
import { dayNumber } from './util';

export interface CardState {
  box: number; // 1..6 once seen
  due: number; // day number when it should be reviewed
  seen: number;
  right: number;
  wrong: number;
  last: number; // timestamp
}

export const INTERVALS = [0, 1, 2, 4, 8, 16, 32]; // days, indexed by box
export const MAX_BOX = INTERVALS.length - 1;
export const KNOWN_BOX = 2;
export const MASTERED_BOX = 4;

export function review(card: CardState | undefined, correct: boolean, now: Date = new Date()): CardState {
  const today = dayNumber(now);
  const prev: CardState = card ?? { box: 0, due: today, seen: 0, right: 0, wrong: 0, last: 0 };
  const box = correct ? Math.min(prev.box + 1, MAX_BOX) : 1;
  return {
    box,
    due: today + (correct ? INTERVALS[box] : 1),
    seen: prev.seen + 1,
    right: prev.right + (correct ? 1 : 0),
    wrong: prev.wrong + (correct ? 0 : 1),
    last: now.getTime(),
  };
}

export function isDue(card: CardState | undefined, today: number = dayNumber()): boolean {
  return !!card && card.due <= today;
}

export type Stage = 'new' | 'learning' | 'known' | 'mastered';

export function stageOf(card: CardState | undefined): Stage {
  if (!card || card.box === 0) return 'new';
  if (card.box >= MASTERED_BOX) return 'mastered';
  if (card.box >= KNOWN_BOX) return 'known';
  return 'learning';
}
