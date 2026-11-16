import { describe, expect, it } from 'vitest';
import { addedLabel, dueLabel, intervalLabel } from './dates';

const NOW = new Date(2026, 10, 16, 20, 0).getTime();
const at = (day: number, hour = 12) => new Date(2026, 10, day, hour).getTime();

describe('addedLabel', () => {
  it('opisuje datę dodania względem dziś', () => {
    expect(addedLabel(at(16, 9), NOW)).toBe('dodane dziś');
    expect(addedLabel(at(15, 23), NOW)).toBe('dodane wczoraj');
    expect(addedLabel(at(13), NOW)).toBe('dodane 3 dni temu');
    expect(addedLabel(at(1), NOW)).toBe('dodane 1 listopada');
    expect(addedLabel(null, NOW)).toBe('dodane przed chwilą');
  });
});

describe('dueLabel', () => {
  it('opisuje termin następnej powtórki', () => {
    expect(dueLabel(NOW - 1000, NOW)).toBe('teraz');
    expect(dueLabel(at(16, 22), NOW)).toBe('dziś');
    expect(dueLabel(at(17, 8), NOW)).toBe('jutro');
    expect(dueLabel(at(20), NOW)).toBe('za 4 dni');
  });
});

describe('intervalLabel', () => {
  it.each([
    [30_000, '< 1 min'],
    [60_000, '< 1 min'],
    [330_000, '6 min'],
    [3 * 3_600_000, '3 godz.'],
    [86_400_000, '1 dzień'],
    [4 * 86_400_000, '4 dni'],
    [65 * 86_400_000, '2 miesiące'],
    [800 * 86_400_000, '2 lata'],
  ])('%i ms → %s', (ms, label) => {
    expect(intervalLabel(ms)).toBe(label);
  });
});
