import { extractPage, openPdf } from './document';
import type { Paragraph } from './layout';

export type PdfInfo = {
  pageCount: number;
  title: string;
  author: string;
  langHint: string | null;
  sample: string;
  /** Akapity z pierwszych stron — od razu trafiają do cache, żeby nie liczyć ich drugi raz. */
  pages: Map<number, Paragraph[]>;
};

const SAMPLE_PAGES = 12;
const SAMPLE_CHARS = 4000;

function infoString(info: object, key: string): string {
  const value = (info as Record<string, unknown>)[key];
  return typeof value === 'string' ? value.trim() : '';
}

export async function inspectPdf(data: ArrayBuffer): Promise<PdfInfo> {
  const doc = await openPdf(data);
  try {
    const { info } = await doc.getMetadata();
    const pages = new Map<number, Paragraph[]>();
    let sample = '';
    let langHint: string | null = infoString(info, 'Language') || null;
    for (
      let n = 1;
      n <= Math.min(doc.numPages, SAMPLE_PAGES) && sample.length < SAMPLE_CHARS;
      n++
    ) {
      const content = await extractPage(doc, n);
      pages.set(n, content.paragraphs);
      langHint ??= content.lang;
      sample += content.paragraphs.map((p) => p.text).join(' ') + ' ';
    }
    return {
      pageCount: doc.numPages,
      title: infoString(info, 'Title'),
      author: infoString(info, 'Author'),
      langHint,
      sample: sample.trim(),
      pages,
    };
  } finally {
    void doc.loadingTask.destroy();
  }
}
