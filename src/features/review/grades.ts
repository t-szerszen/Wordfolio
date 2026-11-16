import type { Grade } from '../../lib/srs/types';

export const GRADES: readonly { grade: Grade; label: string; color: string }[] = [
  { grade: 'again', label: 'Jeszcze raz', color: 'var(--rose)' },
  { grade: 'hard', label: 'Trudne', color: 'var(--ochre)' },
  { grade: 'good', label: 'Dobrze', color: 'var(--sage)' },
  { grade: 'easy', label: 'Łatwe', color: 'var(--clay)' },
];
