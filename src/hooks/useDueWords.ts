import { useMemo } from 'react';
import type { Word } from '../lib/data/models';
import { isDue } from '../lib/srs/scheduler';
import { useNow } from './useNow';
import { useWords } from './useWords';

export function useDueWords(): Word[] {
  const { words } = useWords();
  const now = useNow();
  return useMemo(
    () => words.filter((w) => isDue(w.srs, now)).sort((a, b) => a.srs.due - b.srs.due),
    [words, now],
  );
}
