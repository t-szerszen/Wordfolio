import { useEffect, useState } from 'react';
import type { PDFDocumentProxy } from '../../lib/pdf/document';
import type { Paragraph } from '../../lib/pdf/layout';
import { loadPage } from './pageText';

export type PageState =
  { status: 'loading' } | { status: 'error' } | { status: 'ready'; paragraphs: Paragraph[] };

const LOADING: PageState = { status: 'loading' };

/** Tekst bieżącej strony; sąsiednie strony wczytujemy z wyprzedzeniem w tle. */
export function usePage(doc: PDFDocumentProxy, bookId: string, page: number): PageState {
  const key = `${bookId}:${page}`;
  const [state, setState] = useState<{ key: string; value: PageState } | null>(null);

  useEffect(() => {
    const run = { cancelled: false };
    loadPage(doc, bookId, page).then(
      (paragraphs) => {
        if (!run.cancelled) setState({ key, value: { status: 'ready', paragraphs } });
        for (const next of [page + 1, page - 1]) {
          if (next >= 1 && next <= doc.numPages)
            void loadPage(doc, bookId, next).catch(() => undefined);
        }
      },
      () => {
        if (!run.cancelled) setState({ key, value: { status: 'error' } });
      },
    );
    return () => {
      run.cancelled = true;
    };
  }, [doc, bookId, page, key]);

  return state?.key === key ? state.value : LOADING;
}
