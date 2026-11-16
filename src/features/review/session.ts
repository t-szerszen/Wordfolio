import type { Word } from '../../lib/data/models';
import { dayDiff } from '../../lib/dates';
import { dueWords } from '../../lib/srs/due';
import { isDue, MINUTE, review, statusFor } from '../../lib/srs/scheduler';
import type { Grade } from '../../lib/srs/types';

/** Karta wraca w tej samej sesji, jeśli jej następny termin wypada w ciągu tylu minut. */
const REQUEUE_WINDOW = 20 * MINUTE;
export const EXTRA_CARDS = 5;

export type Session = {
  queue: string[];
  total: number;
  done: number;
  tally: Record<Grade, number>;
};

const EMPTY_TALLY: Record<Grade, number> = { again: 0, hard: 0, good: 0, easy: 0 };

export function startSession(words: readonly Word[], now: number): Session {
  const queue = dueWords(words, now).map((w) => w.id);
  return { queue, total: queue.length, done: 0, tally: { ...EMPTY_TALLY } };
}

/** „Jeszcze 5 kart” — powtórka z wyprzedzeniem tych, których termin wypada najwcześniej. */
export function startExtraSession(words: readonly Word[], now: number): Session {
  const queue = words
    .filter((w) => !isDue(w.srs, now))
    .sort((a, b) => a.srs.due - b.srs.due)
    .slice(0, EXTRA_CARDS)
    .map((w) => w.id);
  return { queue, total: queue.length, done: 0, tally: { ...EMPTY_TALLY } };
}

export type Answer = {
  session: Session;
  word: Word;
};

export function answer(session: Session, word: Word, grade: Grade, now: number): Answer {
  const srs = review(word.srs, grade, now);
  const updated: Word = { ...word, srs, status: statusFor(srs) };
  const rest = session.queue.filter((id) => id !== word.id);
  const again = srs.due - now <= REQUEUE_WINDOW;
  return {
    word: updated,
    session: {
      ...session,
      queue: again ? [...rest, word.id] : rest,
      done: again ? session.done : session.done + 1,
      tally: { ...session.tally, [grade]: session.tally[grade] + 1 },
    },
  };
}

export type Forecast = {
  tomorrow: number;
  fromToday: number;
};

/** Ile kart czeka jutro i ile z nich dodano dziś — do podsumowania sesji. */
export function forecast(words: readonly Word[], now: number): Forecast {
  const dueTomorrow = words.filter((w) => dayDiff(now, w.srs.due) === 1);
  return {
    tomorrow: dueTomorrow.length,
    fromToday: dueTomorrow.filter((w) => w.createdAt !== null && dayDiff(w.createdAt, now) === 0)
      .length,
  };
}
