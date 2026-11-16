import { extractPage, type PDFDocumentProxy } from '../../lib/pdf/document';
import type { Paragraph } from '../../lib/pdf/layout';
import { getCachedPage, putCachedPage } from '../../lib/storage/localStore';

const memory = new Map<string, Promise<Paragraph[]>>();

/**
 * Akapity strony: najpierw pamięć, potem IndexedDB, na końcu pdf.js (w workerze).
 * Wynik trafia do obu cache, więc każdą stronę wyciągamy z PDF-a tylko raz.
 */
export function loadPage(
  doc: PDFDocumentProxy,
  bookId: string,
  page: number,
): Promise<Paragraph[]> {
  const key = `${bookId}:${page}`;
  let pending = memory.get(key);
  if (!pending) {
    pending = (async () => {
      // Cache jest tylko przyspieszeniem: błąd IndexedDB (np. brak miejsca) nie blokuje czytania.
      const cached = await getCachedPage(bookId, page).catch(() => null);
      if (cached) return cached;
      const { paragraphs } = await extractPage(doc, page);
      void putCachedPage(bookId, page, paragraphs).catch(() => undefined);
      return paragraphs;
    })();
    pending.catch(() => memory.delete(key));
    memory.set(key, pending);
  }
  return pending;
}
