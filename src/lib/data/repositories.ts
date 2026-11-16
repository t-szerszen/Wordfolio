import type { Book, Settings, Word } from './models';

export type Unsubscribe = () => void;

/** Metadane migawki potrzebne do statusu synchronizacji. */
export type SnapshotMeta = {
  fromCache: boolean;
  hasPendingWrites: boolean;
};

export type Listener<T> = (value: T, meta: SnapshotMeta) => void;
export type ErrorListener = (error: Error) => void;

/**
 * Zapis zawsze nadpisuje cały dokument (createdAt === null oznacza nowy),
 * więc przy konflikcie wygrywa w całości wersja zapisana na serwerze jako ostatnia.
 */
export type CollectionRepository<T> = {
  subscribe: (onChange: Listener<T[]>, onError: ErrorListener) => Unsubscribe;
  save: (item: T) => Promise<void>;
  remove: (id: string) => Promise<void>;
};

export type BooksRepository = CollectionRepository<Book>;
export type WordsRepository = CollectionRepository<Word>;

export type SettingsRepository = {
  subscribe: (onChange: Listener<Settings | null>, onError: ErrorListener) => Unsubscribe;
  save: (settings: Settings) => Promise<void>;
};
