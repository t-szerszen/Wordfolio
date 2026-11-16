import { useData } from './useData';

export function useBooks() {
  const { books, createBook, saveBook } = useData();
  return { books: books ?? [], loading: books === null, createBook, saveBook };
}
