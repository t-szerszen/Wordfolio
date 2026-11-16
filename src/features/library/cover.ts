import {
  COVER_COLORS,
  COVER_MOTIFS,
  type CoverColor,
  type CoverMotif,
} from '../../lib/data/models';

function pick<T>(list: readonly T[], seed: number): T {
  return list[seed % list.length] as T;
}

/** Kolor i motyw okładki wynikają z hasha pliku, więc są takie same na każdym urządzeniu. */
export function coverFor(bookId: string): { color: CoverColor; motif: CoverMotif } {
  return {
    color: pick(COVER_COLORS, parseInt(bookId.slice(0, 4), 16) || 0),
    motif: pick(COVER_MOTIFS, parseInt(bookId.slice(4, 8), 16) || 0),
  };
}

/** Grzbiety mają różną grubość i wysokość, jak na prawdziwej półce. */
export function spineSize(bookId: string, pageCount: number): { width: number; height: number } {
  const seed = parseInt(bookId.slice(8, 12), 16) || 0;
  const thickness = Math.min(
    42,
    Math.max(28, 26 + Math.round(Math.log2(Math.max(pageCount, 2)) * 2)),
  );
  return { width: thickness, height: 140 + (seed % 31) };
}
