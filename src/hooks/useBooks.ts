import { useData } from './useData';

export function useBooks() {
  const { books, saveBook, removeBook } = useData();
  return { books: books ?? [], loading: books === null, saveBook, removeBook };
}
