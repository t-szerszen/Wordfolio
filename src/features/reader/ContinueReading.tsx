import { Navigate } from 'react-router';
import { useBooks } from '../../hooks/useBooks';
import { useLocalFiles } from '../../hooks/useLocalFiles';

/** Zakładka „Czytaj” otwiera ostatnio czytaną książkę, która ma plik na tym urządzeniu. */
export function ContinueReading() {
  const { books, loading } = useBooks();
  const files = useLocalFiles();
  if (loading || !files.ready) return null;
  const candidates = books.filter((b) => files.has(b.id));
  const last = candidates.reduce<(typeof books)[number] | null>(
    (best, b) => (!best || (b.lastOpenedAt ?? 0) > (best.lastOpenedAt ?? 0) ? b : best),
    null,
  );
  return <Navigate to={last ? `/czytaj/${last.id}` : '/'} replace />;
}
