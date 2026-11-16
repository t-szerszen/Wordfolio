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

/** Przesuwa jeden z końców zaznaczenia, nie pozwalając mu przejść za drugi koniec. */
export function moveEdge(selection: Selection, edge: 'start' | 'end', token: number): Selection {
  if (edge === 'start') return { ...selection, start: Math.min(token, selection.end) };
  return { ...selection, end: Math.max(token, selection.start) };
}
