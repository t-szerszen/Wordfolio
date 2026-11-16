import { useCallback, useEffect, useRef } from 'react';
import { useBooks } from '../../hooks/useBooks';
import type { Book } from '../../lib/data/models';

const SAVE_DELAY = 800;

/**
 * Zapisuje bieżącą stronę z opóźnieniem (szybkie kartkowanie to jeden zapis), a zaległy zapis
 * wysyła przy wyjściu z czytnika i schowaniu aplikacji. Otwarcie strony z linku do przykładu
 * (`deepLinked`) nie przesuwa zakładki, dopóki czytelnik sam nie przewróci kartki.
 */
export function useReadingPosition(book: Book, page: number, deepLinked: boolean): void {
  const { saveBook } = useBooks();
  const latest = useRef({ book, page, saveBook });
  const initialPage = useRef(page);
  const pending = useRef(!deepLinked);
  useEffect(() => {
    latest.current = { book, page, saveBook };
  });

  const flush = useCallback(() => {
    if (!pending.current) return;
    pending.current = false;
    const current = latest.current;
    current.saveBook({ ...current.book, page: current.page, lastOpenedAt: Date.now() });
  }, []);

  useEffect(() => {
    if (page !== initialPage.current) pending.current = true;
    if (!pending.current) return;
    const timer = window.setTimeout(flush, SAVE_DELAY);
    return () => {
      window.clearTimeout(timer);
    };
  }, [page, flush]);

  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === 'hidden') flush();
    };
    window.addEventListener('pagehide', flush);
    document.addEventListener('visibilitychange', onHide);
    return () => {
      window.removeEventListener('pagehide', flush);
      document.removeEventListener('visibilitychange', onHide);
      flush();
    };
  }, [flush]);
}
