import { countLabel } from './plural';

const DAY = 86_400_000;

function startOfDay(ms: number): number {
  const date = new Date(ms);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

/** Różnica w dniach kalendarzowych (czas lokalny), dodatnia w przyszłość. */
export function dayDiff(from: number, to: number): number {
  return Math.round((startOfDay(to) - startOfDay(from)) / DAY);
}

/** „dziś”, „wczoraj”, „3 dni temu”, a starsze — data. */
export function addedLabel(createdAt: number | null, now: number): string {
  if (createdAt === null) return 'dodane przed chwilą';
  const days = dayDiff(createdAt, now);
  if (days <= 0) return 'dodane dziś';
  if (days === 1) return 'dodane wczoraj';
  if (days < 7) return `dodane ${countLabel(days, 'dzień', 'dni', 'dni')} temu`;
  return `dodane ${new Date(createdAt).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long' })}`;
}

/** Kiedy następna powtórka: „teraz”, „dziś”, „jutro”, „za 4 dni”. */
export function dueLabel(due: number, now: number): string {
  if (due <= now) return 'teraz';
  const days = dayDiff(now, due);
  if (days <= 0) return 'dziś';
  if (days === 1) return 'jutro';
  return `za ${countLabel(days, 'dzień', 'dni', 'dni')}`;
}

/** Krótki opis odstępu do podpisów przycisków powtórek: „< 1 min”, „6 min”, „1 dzień”. */
export function intervalLabel(ms: number): string {
  const minutes = Math.round(ms / 60_000);
  if (minutes <= 1) return '< 1 min';
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} godz.`;
  const days = Math.round(ms / DAY);
  if (days < 30) return countLabel(days, 'dzień', 'dni', 'dni');
  const months = Math.round(days / 30);
  if (months < 12) return countLabel(months, 'miesiąc', 'miesiące', 'miesięcy');
  return countLabel(Math.round(days / 365), 'rok', 'lata', 'lat');
}
