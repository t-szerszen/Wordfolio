import type { Book, Settings } from '../../lib/data/models';
import { sha256Hex } from '../../lib/hash';
import { detectLanguage } from '../../lib/language/detect';
import { inspectPdf } from '../../lib/pdf/inspect';
import { putCachedPage, putFile } from '../../lib/storage/localStore';
import { bookTitle } from './bookTitle';
import { coverFor } from './cover';

export type ImportResult =
  | { kind: 'added'; book: Book }
  | { kind: 'restored'; book: Book }
  | { kind: 'error'; message: string };

const MIN_TEXT_CHARS = 80;
const FALLBACK_LANG = 'en';

function isPdf(file: File): boolean {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
}

/**
 * Wgrywa PDF: liczy hash, a jeśli książka już jest w synchronizowanych metadanych,
 * tylko odkłada plik lokalnie (wznowienie czytania na nowym urządzeniu).
 */
export async function importBook(
  file: File,
  books: readonly Book[],
  settings: Settings,
  expectedId?: string,
): Promise<ImportResult> {
  if (!isPdf(file)) return { kind: 'error', message: 'To nie jest plik PDF.' };

  const data = await file.arrayBuffer();
  const id = await sha256Hex(data);

  if (expectedId && id !== expectedId) {
    const expected = books.find((b) => b.id === expectedId);
    return {
      kind: 'error',
      message: `To inny plik niż „${expected?.title ?? 'ta książka'}”. Wybierz dokładnie ten sam PDF, który był wgrany wcześniej.`,
    };
  }

  const existing = books.find((b) => b.id === id);
  if (existing) {
    await putFile(id, file, file.name);
    return { kind: 'restored', book: existing };
  }

  let info;
  try {
    info = await inspectPdf(data);
  } catch {
    return {
      kind: 'error',
      message: 'Nie udało się otworzyć pliku. Może jest uszkodzony albo zabezpieczony hasłem.',
    };
  }

  if (info.sample.length < MIN_TEXT_CHARS) {
    return {
      kind: 'error',
      message:
        'Ten PDF nie ma warstwy tekstowej (to skan albo same obrazy), więc nie da się w nim stukać słów.',
    };
  }

  await putFile(id, file, file.name);
  await Promise.all(
    [...info.pages].map(([page, paragraphs]) => putCachedPage(id, page, paragraphs)),
  );

  const lang =
    settings.bookLang !== 'auto'
      ? settings.bookLang
      : (detectLanguage(info.sample, info.langHint) ?? FALLBACK_LANG);

  const book: Book = {
    id,
    title: bookTitle(info.title, file.name),
    author: info.author.slice(0, 200),
    lang,
    pageCount: info.pageCount,
    fileSize: file.size,
    ...coverFor(id),
    page: 1,
    bookmarks: [],
    lastOpenedAt: null,
    createdAt: null,
    updatedAt: null,
  };
  return { kind: 'added', book };
}
