import { describe, expect, it } from 'vitest';
import { packRows } from './shelfRows';

const item = (id: string, width: number, gap = 3) => ({ id, width, gap });

describe('packRows', () => {
  it('przenosi książkę na nową deskę, gdy się nie mieści', () => {
    const rows = packRows([item('a', 40), item('b', 40), item('c', 40)], 90);
    expect(rows.map((r) => r.map((i) => i.id))).toEqual([['a', 'b'], ['c']]);
  });

  it('nie liczy odstępu przed pierwszą książką w rzędzie', () => {
    const rows = packRows([item('a', 50, 14), item('b', 37)], 90);
    expect(rows).toHaveLength(1);
  });

  it('za szeroki element dostaje własny rząd', () => {
    const rows = packRows([item('a', 40), item('wide', 200), item('b', 40)], 100);
    expect(rows.map((r) => r.map((i) => i.id))).toEqual([['a'], ['wide'], ['b']]);
  });

  it('zwraca pustą listę bez książek', () => {
    expect(packRows([], 300)).toEqual([]);
  });
});
