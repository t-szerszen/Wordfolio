import type { Grade, SrsState } from './types';

/**
 * Wariant SM-2 z krokami nauki, dopasowany do czterech przycisków z designu:
 * dla nowej karty daje kolejno „< 1 min”, „6 min”, „1 dzień”, „4 dni”.
 */
export const MINUTE = 60_000;
export const DAY = 86_400_000;

const LEARNING_STEPS = [1 * MINUTE, 10 * MINUTE] as const;
const RELEARNING_STEP = 10 * MINUTE;
const GRADUATING_DAYS = 1;
const EASY_DAYS = 4;
const START_EASE = 2.5;
const MIN_EASE = 1.3;
const MAX_EASE = 5;
const MAX_DAYS = 36_500;
const KNOWN_AFTER_DAYS = 21;

export function newSrs(now: number): SrsState {
  return {
    phase: 'new',
    due: now,
    intervalDays: 0,
    ease: START_EASE,
    reps: 0,
    lapses: 0,
    step: 0,
    lastReviewedAt: null,
  };
}

function clampEase(ease: number): number {
  return Math.min(MAX_EASE, Math.max(MIN_EASE, Math.round(ease * 100) / 100));
}

function clampDays(days: number): number {
  return Math.min(MAX_DAYS, Math.max(1, Math.round(days)));
}

function stepDelay(step: number): number {
  return LEARNING_STEPS[Math.min(step, LEARNING_STEPS.length - 1)] ?? LEARNING_STEPS[0];
}

function graduate(state: SrsState, now: number, days: number, ease = state.ease): SrsState {
  const intervalDays = clampDays(days);
  return {
    ...state,
    phase: 'review',
    step: 0,
    intervalDays,
    ease: clampEase(ease),
    due: now + intervalDays * DAY,
  };
}

function inLearning(state: SrsState, grade: Grade, now: number): SrsState {
  const step = state.step;
  switch (grade) {
    case 'again':
      return { ...state, phase: 'learning', step: 0, due: now + stepDelay(0) };
    case 'hard': {
      const current = stepDelay(step);
      const next = LEARNING_STEPS[step + 1] ?? current * 1.5;
      return { ...state, phase: 'learning', step, due: now + Math.round((current + next) / 2) };
    }
    case 'good':
      return graduate(state, now, GRADUATING_DAYS);
    case 'easy':
      return graduate(state, now, EASY_DAYS, state.ease + 0.15);
  }
}

function inRelearning(state: SrsState, grade: Grade, now: number): SrsState {
  switch (grade) {
    case 'again':
    case 'hard':
      return { ...state, due: now + RELEARNING_STEP };
    case 'good':
      return graduate(state, now, state.intervalDays);
    case 'easy':
      return graduate(state, now, state.intervalDays + 1, state.ease + 0.15);
  }
}

/**
 * Odstępy rosną z oceną (Trudne < Dobrze < Łatwe), więc każdy przycisk daje inny termin.
 * Powtórka przed terminem („Jeszcze 5 kart”) liczy wzrost od czasu, który faktycznie minął,
 * a nie od pełnego odstępu — inaczej karty za szybko trafiałyby do „znanych”.
 */
function reviewIntervals(
  state: SrsState,
  now: number,
): { hard: number; good: number; easy: number } {
  const interval = Math.max(1, state.intervalDays);
  const early = state.due > now && state.lastReviewedAt !== null;
  const base = early ? Math.max(0, (now - (state.lastReviewedAt ?? now)) / DAY) : interval;
  const hard = clampDays(Math.max(early ? interval : interval + 1, base * 1.2));
  const good = clampDays(Math.max(hard + 1, base * state.ease));
  const easy = clampDays(Math.max(good + 1, base * state.ease * 1.3));
  return { hard, good, easy };
}

function inReview(state: SrsState, grade: Grade, now: number): SrsState {
  if (grade === 'again') {
    return {
      ...state,
      phase: 'relearning',
      step: 0,
      lapses: state.lapses + 1,
      ease: clampEase(state.ease - 0.2),
      intervalDays: clampDays(Math.max(1, state.intervalDays) * 0.5),
      due: now + RELEARNING_STEP,
    };
  }
  const days = reviewIntervals(state, now);
  if (grade === 'hard') return graduate(state, now, days.hard, state.ease - 0.15);
  if (grade === 'good') return graduate(state, now, days.good);
  return graduate(state, now, days.easy, state.ease + 0.15);
}

export function review(state: SrsState, grade: Grade, now: number): SrsState {
  const base = { ...state, reps: state.reps + 1, lastReviewedAt: now };
  switch (state.phase) {
    case 'new':
    case 'learning':
      return inLearning(base, grade, now);
    case 'relearning':
      return inRelearning(base, grade, now);
    case 'review':
      return inReview(base, grade, now);
  }
}

/** Ile czasu do następnej powtórki dałaby każda odpowiedź — do podpisów przycisków. */
export function previewIntervals(state: SrsState, now: number): Record<Grade, number> {
  return {
    again: review(state, 'again', now).due - now,
    hard: review(state, 'hard', now).due - now,
    good: review(state, 'good', now).due - now,
    easy: review(state, 'easy', now).due - now,
  };
}

export type DerivedStatus = 'new' | 'learning' | 'known';

export function statusFor(state: SrsState): DerivedStatus {
  if (state.phase === 'new') return 'new';
  return state.phase === 'review' && state.intervalDays >= KNOWN_AFTER_DAYS ? 'known' : 'learning';
}

/** Ręczna zmiana statusu na karcie słówka przestawia też harmonogram, żeby oba się zgadzały. */
export function applyStatus(state: SrsState, status: DerivedStatus, now: number): SrsState {
  if (status === 'new') return newSrs(now);
  if (status === 'known') {
    const days = Math.max(KNOWN_AFTER_DAYS, state.intervalDays);
    return { ...state, phase: 'review', step: 0, intervalDays: days, due: now + days * DAY };
  }
  if (state.phase === 'new') return { ...state, phase: 'learning', step: 0, due: now };
  if (state.phase === 'review' && state.intervalDays >= KNOWN_AFTER_DAYS) {
    const days = 3;
    return { ...state, intervalDays: days, due: now + days * DAY };
  }
  return state;
}

export function isDue(state: SrsState, now: number): boolean {
  return state.due <= now;
}
