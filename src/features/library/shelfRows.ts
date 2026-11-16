export type ShelfItem = {
  width: number;
  /** Odstęp od poprzedniego elementu w tym samym rzędzie. */
  gap: number;
};

/** Rozkłada książki na kolejne deski tak, żeby żaden rząd nie wychodził poza szerokość półki. */
export function packRows<T extends ShelfItem>(items: readonly T[], available: number): T[][] {
  const rows: T[][] = [];
  let row: T[] = [];
  let used = 0;
  for (const item of items) {
    const extra = row.length === 0 ? item.width : item.gap + item.width;
    if (row.length > 0 && used + extra > available) {
      rows.push(row);
      row = [item];
      used = item.width;
    } else {
      row.push(item);
      used += extra;
    }
  }
  if (row.length > 0) rows.push(row);
  return rows;
}
