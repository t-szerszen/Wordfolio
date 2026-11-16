import { useMemo } from 'react';
import type { Word } from '../lib/data/models';
import { baseLanguage } from '../lib/language/names';
import { normalizeTerm } from '../lib/text/tokenize';
import { useWords } from './useWords';

/** Zapisane słowa danego języka po znormalizowanej postaci — do podkreśleń i notatek w czytniku. */
export function useWordIndex(lang: string): ReadonlyMap<string, Word> {
  const { words } = useWords();
  return useMemo(() => {
    const base = baseLanguage(lang);
    const map = new Map<string, Word>();
    for (const word of words) {
      if (baseLanguage(word.lang) === base) map.set(normalizeTerm(word.term, lang), word);
    }
    return map;
  }, [words, lang]);
}
