import { describe, expect, it } from 'vitest';
import { computeStreak, dayKey } from './streak';

describe('computeStreak', () => {
  it('liczy dni z rzędu kończące się dziś', () => {
    expect(computeStreak(['2026-11-14', '2026-11-15', '2026-11-16'], '2026-11-16')).toEqual({
      count: 3,
      doneToday: true,
    });
  });

  it('nie przerywa serii, jeśli dziś jeszcze nie było powtórki', () => {
    expect(computeStreak(['2026-11-14', '2026-11-15'], '2026-11-16')).toEqual({
      count: 2,
      doneToday: false,
    });
  });

  it('zeruje serię po dniu przerwy i przechodzi przez granicę miesiąca', () => {
    expect(computeStreak(['2026-11-13'], '2026-11-16').count).toBe(0);
    expect(computeStreak(['2026-10-31', '2026-11-01'], '2026-11-01').count).toBe(2);
  });
});

describe('dayKey', () => {
  it('formatuje datę lokalną', () => {
    expect(dayKey(new Date(2026, 0, 5, 23, 30))).toBe('2026-01-05');
  });
});
