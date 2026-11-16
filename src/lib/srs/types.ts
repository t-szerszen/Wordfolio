export type SrsPhase = 'new' | 'learning' | 'review' | 'relearning';

export type Grade = 'again' | 'hard' | 'good' | 'easy';

export type SrsState = {
  phase: SrsPhase;
  /** Termin następnej powtórki (ms od epoki). */
  due: number;
  intervalDays: number;
  ease: number;
  reps: number;
  lapses: number;
  /** Indeks kroku nauki w fazie learning/relearning. */
  step: number;
  lastReviewedAt: number | null;
};
