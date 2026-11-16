import { useMemo } from 'react';
import type { WordStatus } from '../lib/data/models';
import { baseLanguage } from '../lib/language/names';
import { normalizeTerm } from '../lib/text/tokenize';
import { useWords } from './useWords';

/** Statusy zapisanych słów danego języka — do podkreśleń w tekście książki. */
export function useWordStatuses(lang: string): ReadonlyMap<string, WordStatus> {
  const { words } = useWords();
  return useMemo(() => {
    const base = baseLanguage(lang);
    const map = new Map<string, WordStatus>();
    for (const word of words) {
      if (baseLanguage(word.lang) === base) map.set(normalizeTerm(word.term, lang), word.status);
    }
    return map;
  }, [words, lang]);
}
