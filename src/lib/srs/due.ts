import type { Word } from '../data/models';
import { isDue } from './scheduler';

/** Słówka do powtórki teraz, od najdawniej zaległego. */
export function dueWords(words: readonly Word[], now: number): Word[] {
  return words.filter((w) => isDue(w.srs, now)).sort((a, b) => a.srs.due - b.srs.due);
}
