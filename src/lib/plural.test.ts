import { describe, expect, it } from 'vitest';
import { countLabel } from './plural';

describe('countLabel', () => {
  it.each([
    [1, '1 słówko'],
    [2, '2 słówka'],
    [4, '4 słówka'],
    [5, '5 słówek'],
    [12, '12 słówek'],
    [22, '22 słówka'],
    [25, '25 słówek'],
    [0, '0 słówek'],
  ])('%i → %s', (count, expected) => {
    expect(countLabel(count, 'słówko', 'słówka', 'słówek')).toBe(expected);
  });
});
