import { useEffect, useState } from 'react';
import { openPdf, type PDFDocumentProxy } from '../../lib/pdf/document';
import { loadChapters, type Chapter } from '../../lib/pdf/outline';
import { getFile } from '../../lib/storage/localStore';

export type BookDocument =
  | { status: 'loading' }
  | { status: 'missing' }
  | { status: 'error' }
  | { status: 'ready'; doc: PDFDocumentProxy; chapters: Chapter[] };

const LOADING: BookDocument = { status: 'loading' };

export function useBookDocument(bookId: string, reloadKey: number): BookDocument {
  const key = `${bookId}:${reloadKey}`;
  const [state, setState] = useState<{ key: string; value: BookDocument } | null>(null);

  useEffect(() => {
    const run = { cancelled: false, doc: null as PDFDocumentProxy | null };
    const finish = (value: BookDocument) => {
      if (!run.cancelled) setState({ key, value });
    };
    void (async () => {
      try {
        const file = await getFile(bookId);
        if (!file) {
          finish({ status: 'missing' });
          return;
        }
        run.doc = await openPdf(await file.arrayBuffer());
        finish({ status: 'ready', doc: run.doc, chapters: await loadChapters(run.doc) });
      } catch {
        finish({ status: 'error' });
      }
    })();
    return () => {
      run.cancelled = true;
      void run.doc?.loadingTask.destroy();
    };
  }, [bookId, key]);

  return state?.key === key ? state.value : LOADING;
}
