import type { Book, Settings, SettingsInput, Word } from './models';

export type Unsubscribe = () => void;

/** Metadane migawki potrzebne do statusu synchronizacji. */
export type SnapshotMeta = {
  fromCache: boolean;
  hasPendingWrites: boolean;
};

export type Listener<T> = (value: T, meta: SnapshotMeta) => void;
export type ErrorListener = (error: Error) => void;

/**
 * Identyfikatory są deterministyczne (hash pliku, hash słowa), więc to samo słowo czy książka
 * powstaje niezależnie na kilku urządzeniach. Dlatego tworzenie nigdy nie nadpisuje istniejącego
 * dokumentu, a aktualizacja nadpisuje wszystkie pola treści (bez createdAt) — last-write-wins.
 */
export type CollectionRepository<T> = {
  subscribe: (onChange: Listener<T[]>, onError: ErrorListener) => Unsubscribe;
  create: (item: T) => Promise<void>;
  update: (item: T) => Promise<void>;
  remove: (id: string) => Promise<void>;
};

export type BooksRepository = Omit<CollectionRepository<Book>, 'remove'>;
export type WordsRepository = CollectionRepository<Word>;

export type SettingsRepository = {
  subscribe: (onChange: Listener<Settings | null>, onError: ErrorListener) => Unsubscribe;
  /** Zapisuje ustawienia; dni powtórek tylko dopisuje (suma zbiorów), żeby nie zgubić serii z innych urządzeń. */
  save: (settings: Omit<SettingsInput, 'reviewDays'>, addDays: readonly string[]) => Promise<void>;
};
