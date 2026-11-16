import { useData } from './useData';

export function useWords() {
  const { words, saveWord, removeWord } = useData();
  return { words: words ?? [], loading: words === null, saveWord, removeWord };
}
