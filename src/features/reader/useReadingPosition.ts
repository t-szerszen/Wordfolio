import { useEffect, useRef } from 'react';
import { useBooks } from '../../hooks/useBooks';
import type { Book } from '../../lib/data/models';

const SAVE_DELAY = 800;

/** Zapisuje bieżącą stronę z opóźnieniem, żeby szybkie kartkowanie nie generowało zapisów. */
export function useReadingPosition(book: Book, page: number): void {
  const { saveBook } = useBooks();
  const latest = useRef({ book, saveBook });
  useEffect(() => {
    latest.current = { book, saveBook };
  });

  useEffect(() => {
    const save = () => {
      const { book: current, saveBook: save } = latest.current;
      save({ ...current, page, lastOpenedAt: Date.now() });
    };
    const timer = window.setTimeout(save, SAVE_DELAY);
    return () => {
      window.clearTimeout(timer);
    };
  }, [page]);
}
