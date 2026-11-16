import { useEffect, useState } from 'react';
import type { PDFDocumentLoadingTask } from 'pdfjs-dist';
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
    const run: { cancelled: boolean; task: PDFDocumentLoadingTask | null } = {
      cancelled: false,
      task: null,
    };
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
        run.task = await openPdf(await file.arrayBuffer());
        if (run.cancelled) return;
        const doc = await run.task.promise;
        finish({ status: 'ready', doc, chapters: await loadChapters(doc) });
      } catch {
        finish({ status: 'error' });
      }
    })();
    return () => {
      run.cancelled = true;
      void run.task?.destroy();
    };
  }, [bookId, key]);

  return state?.key === key ? state.value : LOADING;
}
