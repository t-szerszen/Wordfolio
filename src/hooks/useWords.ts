import { useData } from './useData';

export function useWords() {
  const { words, createWord, saveWord, removeWord } = useData();
  return { words: words ?? [], loading: words === null, createWord, saveWord, removeWord };
}
