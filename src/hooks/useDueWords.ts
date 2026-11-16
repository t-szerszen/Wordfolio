import { useMemo } from 'react';
import type { Word } from '../lib/data/models';
import { dueWords } from '../lib/srs/due';
import { useNow } from './useNow';
import { useWords } from './useWords';

export function useDueWords(): Word[] {
  const { words } = useWords();
  const now = useNow();
  return useMemo(() => dueWords(words, now), [words, now]);
}
