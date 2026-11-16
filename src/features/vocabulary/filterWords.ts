import type { Word, WordStatus } from '../../lib/data/models';

export type WordFilter = {
  query: string;
  status: WordStatus | 'all';
  /** null — wszystkie książki. */
  bookId: string | null;
  tags: readonly string[];
};

export type WordSort = 'recent' | 'az';

/** Wyszukiwanie bez polskich znaków i akcentów: „zerknela” znajdzie „zerknęła”. */
export function foldText(text: string): string {
  return text
    .toLocaleLowerCase('pl')
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/ł/g, 'l')
    .replace(/ß/g, 'ss');
}

export function filterWords(words: readonly Word[], filter: WordFilter, sort: WordSort): Word[] {
  const query = foldText(filter.query.trim());
  const result = words.filter(
    (word) =>
      (filter.status === 'all' || word.status === filter.status) &&
      (filter.bookId === null || word.context.bookId === filter.bookId) &&
      filter.tags.every((tag) => word.tags.includes(tag)) &&
      (query === '' ||
        foldText(word.term).includes(query) ||
        foldText(word.translation).includes(query) ||
        foldText(word.note).includes(query)),
  );
  return result.sort((a, b) =>
    sort === 'az'
      ? a.term.localeCompare(b.term, a.lang, { sensitivity: 'base' })
      : (b.createdAt ?? Infinity) - (a.createdAt ?? Infinity),
  );
}

/** Najczęściej używane etykiety — pokazujemy je jako szybkie filtry. */
export function topTags(words: readonly Word[], limit: number): string[] {
  const counts = new Map<string, number>();
  for (const word of words)
    for (const tag of word.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'pl'))
    .slice(0, limit)
    .map(([tag]) => tag);
}
