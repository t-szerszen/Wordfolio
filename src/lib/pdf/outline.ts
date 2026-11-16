import type { PDFDocumentProxy } from './document';

export type Chapter = {
  title: string;
  page: number;
};

type OutlineNode = Awaited<ReturnType<PDFDocumentProxy['getOutline']>>[number];

async function pageOf(doc: PDFDocumentProxy, dest: OutlineNode['dest']): Promise<number | null> {
  const explicit = typeof dest === 'string' ? await doc.getDestination(dest) : dest;
  const ref: unknown = explicit?.[0];
  if (typeof ref === 'number') return ref + 1;
  if (typeof ref === 'object' && ref !== null && 'num' in ref && 'gen' in ref) {
    return (await doc.getPageIndex(ref as { num: number; gen: number })) + 1;
  }
  return null;
}

/** Rozdziały z zakładek PDF (pierwszy poziom). Brak spisu treści to pusta lista. */
export async function loadChapters(doc: PDFDocumentProxy): Promise<Chapter[]> {
  try {
    const outline = await doc.getOutline();
    const chapters = await Promise.all(
      outline.map(async (node) => ({
        title: node.title.trim(),
        page: await pageOf(doc, node.dest),
      })),
    );
    return chapters
      .filter((c): c is Chapter => c.page !== null && c.title !== '')
      .sort((a, b) => a.page - b.page);
  } catch {
    return [];
  }
}
