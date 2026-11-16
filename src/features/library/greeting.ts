export function greetingFor(date: Date): string {
  const hour = date.getHours();
  return hour >= 18 || hour < 4 ? 'Dobry wieczór' : 'Dzień dobry';
}

const DAY_PARTS = [
  { from: 4, label: 'rano' },
  { from: 11, label: 'południe' },
  { from: 13, label: 'popołudnie' },
  { from: 18, label: 'wieczór' },
  { from: 23, label: 'noc' },
] as const;

export function dayLabelFor(date: Date): string {
  const weekday = date.toLocaleDateString('pl-PL', { weekday: 'long' });
  const hour = date.getHours();
  const part = DAY_PARTS.findLast((p) => hour >= p.from)?.label ?? 'noc';
  return `${weekday}, ${part}`;
}
