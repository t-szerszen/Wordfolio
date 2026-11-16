/** Klucz dnia w czasie lokalnym (RRRR-MM-DD). */
export function dayKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function previousDay(key: string): string {
  const [y = 0, m = 1, d = 1] = key.split('-').map(Number);
  return dayKey(new Date(y, m - 1, d - 1));
}

export type Streak = {
  count: number;
  doneToday: boolean;
};

/** Seria liczy się do dziś albo — jeśli dziś jeszcze nie było powtórki — do wczoraj. */
export function computeStreak(days: readonly string[], today: string): Streak {
  const set = new Set(days);
  const doneToday = set.has(today);
  let cursor = doneToday ? today : previousDay(today);
  let count = 0;
  while (set.has(cursor)) {
    count++;
    cursor = previousDay(cursor);
  }
  return { count, doneToday };
}
