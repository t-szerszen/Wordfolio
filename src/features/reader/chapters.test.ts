import { describe, expect, it } from 'vitest';
import { chapterAt, positionLabel, toRoman } from './chapters';

describe('toRoman', () => {
  it.each([
    [1, 'I'],
    [4, 'IV'],
    [9, 'IX'],
    [14, 'XIV'],
    [40, 'XL'],
    [1994, 'MCMXCIV'],
  ])('%i → %s', (value, expected) => {
    expect(toRoman(value)).toBe(expected);
  });
});

describe('chapterAt', () => {
  const chapters = [
    { title: 'Down the Rabbit-Hole', page: 3 },
    { title: 'The Pool of Tears', page: 9 },
  ];

  it('zwraca rozdział, w którym leży strona', () => {
    expect(chapterAt(chapters, 5)).toEqual({ number: 'I', title: 'Down the Rabbit-Hole' });
    expect(chapterAt(chapters, 9)).toEqual({ number: 'II', title: 'The Pool of Tears' });
  });

  it('zwraca null przed pierwszym rozdziałem i bez spisu treści', () => {
    expect(chapterAt(chapters, 1)).toBeNull();
    expect(chapterAt([], 4)).toBeNull();
  });
});

describe('positionLabel', () => {
  it('łączy rozdział i stronę', () => {
    expect(positionLabel({ number: 'I', title: 'x' }, 3, 98)).toBe('rozdz. I · s. 3 z 98');
    expect(positionLabel(null, 3, 98)).toBe('s. 3 z 98');
  });
});
