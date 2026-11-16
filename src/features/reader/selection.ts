import type { Token } from '../../lib/text/tokenize';

/** Zaznaczenie w obrębie jednego akapitu: indeksy tokenów-słów (włącznie). */
export type Selection = {
  paragraph: number;
  start: number;
  end: number;
};

export function isPhrase(selection: Selection): boolean {
  return selection.end > selection.start;
}

export function selectionRange(
  tokens: readonly Token[],
  selection: Selection,
): { from: number; to: number } {
  const first = tokens[selection.start];
  const last = tokens[selection.end];
  return { from: first?.start ?? 0, to: last ? last.start + last.text.length : 0 };
}

/** Wyrażenie to kilka słów, a nie akapit — do tłumaczenia wysyłamy tylko krótki fragment. */
export const MAX_PHRASE_WORDS = 8;
export const MAX_PHRASE_CHARS = 120;

/**
 * Przesuwa jeden z końców zaznaczenia, nie pozwalając mu przejść za drugi koniec
 * ani rozciągnąć wyrażenia ponad limit słów i znaków.
 */
export function moveEdge(
  tokens: readonly Token[],
  selection: Selection,
  edge: 'start' | 'end',
  token: number,
): Selection {
  const next =
    edge === 'start'
      ? { ...selection, start: Math.min(token, selection.end) }
      : { ...selection, end: Math.max(token, selection.start) };
  const words = tokens.slice(next.start, next.end + 1).filter((t) => t.word).length;
  const { from, to } = selectionRange(tokens, next);
  return words > MAX_PHRASE_WORDS || to - from > MAX_PHRASE_CHARS ? selection : next;
}
