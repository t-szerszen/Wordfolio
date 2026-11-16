import type * as PdfJs from 'pdfjs-dist';
import type { PDFDocumentLoadingTask, PDFDocumentProxy } from 'pdfjs-dist';
import type { TextItem } from 'pdfjs-dist/types/src/display/api';
import { layoutParagraphs, type Paragraph, type RawItem } from './layout';

export type { PDFDocumentProxy };

let pdfjsPromise: Promise<typeof PdfJs> | null = null;

/** pdf.js i jego worker ładujemy dopiero przy pierwszym otwarciu PDF-a. */
function loadPdfjs(): Promise<typeof PdfJs> {
  pdfjsPromise ??= Promise.all([
    import('pdfjs-dist'),
    import('pdfjs-dist/build/pdf.worker.min.mjs?url'),
  ]).then(([lib, worker]) => {
    // Adres z ?url uwzględnia base „/Wordfolio/”, więc worker działa także na GitHub Pages.
    lib.GlobalWorkerOptions.workerSrc = worker.default;
    return lib;
  });
  return pdfjsPromise;
}

/**
 * Zwraca zadanie ładowania, a nie sam dokument: tylko ono pozwala zwolnić worker i pamięć,
 * gdy użytkownik wyjdzie z czytnika, zanim PDF się otworzy, albo gdy otwarcie się nie uda.
 */
export async function openPdf(data: ArrayBuffer): Promise<PDFDocumentLoadingTask> {
  const pdfjs = await loadPdfjs();
  // pdf.js przekazuje bufor do workera i go odłącza — dajemy mu kopię.
  return pdfjs.getDocument({ data: new Uint8Array(data.slice(0)), verbosity: 0 });
}

function isTextItem(item: unknown): item is TextItem {
  return typeof item === 'object' && item !== null && 'str' in item && 'transform' in item;
}

function toRawItem(item: TextItem): RawItem {
  const [, , c = 0, d = 0, x = 0, y = 0] = item.transform as number[];
  return {
    str: item.str,
    x,
    y,
    width: item.width,
    height: item.height || Math.hypot(c, d),
  };
}

export type PageContent = {
  paragraphs: Paragraph[];
  lang: string | null;
};

export async function extractPage(doc: PDFDocumentProxy, pageNumber: number): Promise<PageContent> {
  const page = await doc.getPage(pageNumber);
  try {
    const content = await page.getTextContent();
    const items = content.items.filter(isTextItem).map(toRawItem);
    return { paragraphs: layoutParagraphs(items), lang: content.lang };
  } finally {
    page.cleanup();
  }
}
