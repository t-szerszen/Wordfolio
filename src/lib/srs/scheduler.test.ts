import { describe, expect, it } from 'vitest';
import {
  applyStatus,
  DAY,
  isDue,
  MINUTE,
  newSrs,
  previewIntervals,
  review,
  statusFor,
} from './scheduler';
import type { SrsState } from './types';

const NOW = Date.UTC(2026, 10, 16, 18, 0, 0);

function reviewCard(intervalDays: number, ease = 2.5): SrsState {
  return { ...newSrs(NOW), phase: 'review', intervalDays, ease, reps: 3, due: NOW };
}

describe('nowa karta', () => {
  it('jest od razu do powtórki', () => {
    expect(isDue(newSrs(NOW), NOW)).toBe(true);
  });

  it('daje odstępy zgodne z przyciskami w designie', () => {
    const preview = previewIntervals(newSrs(NOW), NOW);
    expect(preview.again).toBe(1 * MINUTE);
    expect(Math.round(preview.hard / MINUTE)).toBe(6);
    expect(preview.good).toBe(1 * DAY);
    expect(preview.easy).toBe(4 * DAY);
  });

  it('po „Jeszcze raz” wraca do nauki od pierwszego kroku', () => {
    const next = review(newSrs(NOW), 'again', NOW);
    expect(next).toMatchObject({ phase: 'learning', step: 0, reps: 1, lastReviewedAt: NOW });
  });

  it('po „Dobrze” przechodzi do powtórek z odstępem jednego dnia', () => {
    const next = review(newSrs(NOW), 'good', NOW);
    expect(next).toMatchObject({ phase: 'review', intervalDays: 1, due: NOW + DAY });
  });

  it('po „Łatwe” podnosi łatwość', () => {
    expect(review(newSrs(NOW), 'easy', NOW).ease).toBeCloseTo(2.65);
  });
});

describe('karta w powtórkach', () => {
  it('„Dobrze” mnoży odstęp przez łatwość', () => {
    const next = review(reviewCard(10), 'good', NOW);
    expect(next.intervalDays).toBe(25);
    expect(next.due).toBe(NOW + 25 * DAY);
  });

  it('„Trudne” wydłuża odstęp nieznacznie i obniża łatwość', () => {
    const next = review(reviewCard(10), 'hard', NOW);
    expect(next.intervalDays).toBe(12);
    expect(next.ease).toBeCloseTo(2.35);
  });

  it('„Łatwe” daje najdłuższy odstęp', () => {
    const next = review(reviewCard(10), 'easy', NOW);
    expect(next.intervalDays).toBe(33);
  });

  it('odstęp zawsze rośnie co najmniej o dzień', () => {
    expect(review(reviewCard(1, 1.3), 'hard', NOW).intervalDays).toBe(2);
  });

  it('„Jeszcze raz” to pomyłka: krótszy odstęp, niższa łatwość i ponowna nauka', () => {
    const lapsed = review(reviewCard(20), 'again', NOW);
    expect(lapsed).toMatchObject({
      phase: 'relearning',
      lapses: 1,
      intervalDays: 10,
      due: NOW + 10 * MINUTE,
    });
    expect(lapsed.ease).toBeCloseTo(2.3);
    const relearned = review(lapsed, 'good', NOW + 10 * MINUTE);
    expect(relearned).toMatchObject({ phase: 'review', intervalDays: 10 });
  });

  it('każdy przycisk daje inny, rosnący odstęp', () => {
    for (const [interval, ease] of [
      [1, 2.5],
      [2, 1.3],
      [30, 2.1],
    ] as const) {
      const card = reviewCard(interval, ease);
      const hard = review(card, 'hard', NOW).intervalDays;
      const good = review(card, 'good', NOW).intervalDays;
      const easy = review(card, 'easy', NOW).intervalDays;
      expect(hard).toBeLessThan(good);
      expect(good).toBeLessThan(easy);
    }
  });

  it('powtórka przed terminem nie nadmuchuje odstępu', () => {
    const card = { ...reviewCard(10), lastReviewedAt: NOW - DAY, due: NOW + 9 * DAY };
    expect(review(card, 'good', NOW).intervalDays).toBe(11);
    expect(review(card, 'easy', NOW).intervalDays).toBe(12);
  });

  it('łatwość nie spada poniżej 1,3', () => {
    let state = reviewCard(5, 1.35);
    for (let i = 0; i < 5; i++) state = review(state, 'again', NOW);
    expect(state.ease).toBe(1.3);
  });
});

describe('status słówka', () => {
  it('wynika z fazy i długości odstępu', () => {
    expect(statusFor(newSrs(NOW))).toBe('new');
    expect(statusFor(reviewCard(3))).toBe('learning');
    expect(statusFor(reviewCard(30))).toBe('known');
  });

  it('ręczna zmiana statusu przestawia harmonogram', () => {
    expect(statusFor(applyStatus(newSrs(NOW), 'known', NOW))).toBe('known');
    expect(applyStatus(reviewCard(30), 'new', NOW)).toEqual(newSrs(NOW));
    expect(statusFor(applyStatus(reviewCard(30), 'learning', NOW))).toBe('learning');
    expect(applyStatus(newSrs(NOW), 'learning', NOW).phase).toBe('learning');
  });
});
