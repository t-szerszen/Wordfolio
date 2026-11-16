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
      const cached = await getCachedPage(bookId, page);
      if (cached) return cached;
      const { paragraphs } = await extractPage(doc, page);
      await putCachedPage(bookId, page, paragraphs);
      return paragraphs;
    })();
    pending.catch(() => memory.delete(key));
    memory.set(key, pending);
  }
  return pending;
}
