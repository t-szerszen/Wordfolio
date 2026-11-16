import type { MarginSize } from '../../lib/data/models';

export const FONT_STEPS = [16, 17, 18, 19, 20, 22, 24] as const;
export const MIN_FONT = 16;
export const MAX_FONT = 24;

export const LINE_HEIGHTS = [
  { label: 'ciasno', value: 1.45, icon: 'M3 6 L 17 6 M3 10 L 17 10 M3 14 L 17 14' },
  { label: 'wygodnie', value: 1.62, icon: 'M3 4.5 L 17 4.5 M3 10 L 17 10 M3 15.5 L 17 15.5' },
  { label: 'luźno', value: 1.85, icon: 'M3 3 L 17 3 M3 10 L 17 10 M3 17 L 17 17' },
] as const;

export const MARGINS: readonly { label: string; value: MarginSize; icon: string }[] = [
  { label: 'wąskie', value: 'narrow', icon: 'M5.5 7 L 14.5 7 M5.5 10 L 14.5 10 M5.5 13 L 14.5 13' },
  { label: 'średnie', value: 'medium', icon: 'M7 7 L 13 7 M7 10 L 13 10 M7 13 L 13 13' },
  { label: 'szerokie', value: 'wide', icon: 'M8.5 7 L 11.5 7 M8.5 10 L 11.5 10 M8.5 13 L 11.5 13' },
];

/** Wąskie marginesy = szerszy łam. Telefon: odstęp od krawędzi, większe ekrany: szerokość łamu. */
export const MARGIN_SIDE: Record<MarginSize, number> = { narrow: 18, medium: 26, wide: 38 };
export const MEASURE_TABLET: Record<MarginSize, number> = { narrow: 560, medium: 500, wide: 440 };
export const MEASURE_DESKTOP: Record<MarginSize, number> = { narrow: 720, medium: 640, wide: 580 };

export function stepFontSize(current: number, direction: -1 | 1): number {
  const index = FONT_STEPS.findIndex((size) => size >= current);
  const base = index === -1 ? FONT_STEPS.length - 1 : index;
  const next = Math.min(FONT_STEPS.length - 1, Math.max(0, base + direction));
  return FONT_STEPS[next] ?? current;
}
