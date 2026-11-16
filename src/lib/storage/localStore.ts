import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import { LAYOUT_VERSION, type Paragraph } from '../pdf/layout';

/**
 * Pliki PDF i dane pochodne trzymamy tylko lokalnie (IndexedDB) — do Firestore trafiają metadane.
 */
type WordfolioDB = DBSchema & {
  files: { key: string; value: { blob: Blob; name: string; addedAt: number } };
  pages: { key: string; value: { paragraphs: Paragraph[] } };
  translations: { key: string; value: { result: unknown; savedAt: number } };
};

let dbPromise: Promise<IDBPDatabase<WordfolioDB>> | null = null;

function db(): Promise<IDBPDatabase<WordfolioDB>> {
  dbPromise ??= openDB<WordfolioDB>('wordfolio', 1, {
    upgrade(database) {
      database.createObjectStore('files');
      database.createObjectStore('pages');
      database.createObjectStore('translations');
    },
  });
  return dbPromise;
}

export async function putFile(bookId: string, blob: Blob, name: string): Promise<void> {
  await (await db()).put('files', { blob, name, addedAt: Date.now() }, bookId);
}

export async function getFile(bookId: string): Promise<Blob | null> {
  return (await (await db()).get('files', bookId))?.blob ?? null;
}

export async function listFileIds(): Promise<string[]> {
  return (await db()).getAllKeys('files');
}

function pageKey(bookId: string, page: number): string {
  return `${bookId}:${page}:v${LAYOUT_VERSION}`;
}

export async function getCachedPage(bookId: string, page: number): Promise<Paragraph[] | null> {
  return (await (await db()).get('pages', pageKey(bookId, page)))?.paragraphs ?? null;
}

export async function putCachedPage(
  bookId: string,
  page: number,
  paragraphs: Paragraph[],
): Promise<void> {
  await (await db()).put('pages', { paragraphs }, pageKey(bookId, page));
}

export async function getCachedTranslation(key: string): Promise<unknown> {
  return (await (await db()).get('translations', key))?.result ?? null;
}

export async function putCachedTranslation(key: string, result: unknown): Promise<void> {
  await (await db()).put('translations', { result, savedAt: Date.now() }, key);
}
