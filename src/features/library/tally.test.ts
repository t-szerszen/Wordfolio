import { describe, expect, it } from 'vitest';
import { tallyPaths, tallyWidth } from './tally';

describe('tallyPaths', () => {
  it('rysuje jedną kreskę na dzień, co piąta przekreśla grupę', () => {
    const paths = tallyPaths(12);
    expect(paths).toHaveLength(12);
    expect(paths[4]).toMatch(/^M1\.5 24/);
    expect(paths[9]).toMatch(/^M41\.5 24/);
  });

  it('szerokość rośnie z liczbą grup', () => {
    expect(tallyWidth(3)).toBe(40);
    expect(tallyWidth(12)).toBe(120);
  });
});
