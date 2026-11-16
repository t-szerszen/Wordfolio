import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { DataContext, type DataContextValue } from '../hooks/dataContext';
import { useOnline } from '../hooks/useOnline';
import { DEFAULT_SETTINGS, type Book, type Settings, type Word } from '../lib/data/models';
import type { SnapshotMeta } from '../lib/data/repositories';
import { computeSyncStatus } from '../lib/data/syncStatus';
import { readCachedTheme } from '../features/settings/theme';
import type { Repositories } from './backend';

type DataProviderProps = {
  repositories: Repositories;
  syncNow: () => Promise<void>;
  children: ReactNode;
};

type Metas = {
  books: SnapshotMeta | null;
  words: SnapshotMeta | null;
  settings: SnapshotMeta | null;
};

const EMPTY_METAS: Metas = { books: null, words: null, settings: null };

const LOAD_ERROR = 'Nie udało się wczytać danych. Sprawdź połączenie i reguły Firestore.';
const SAVE_ERROR = 'Nie udało się zapisać zmian na serwerze. Zostały tylko na tym urządzeniu.';

/** Jeden nasłuch na każdą kolekcję — wszystkie ekrany czytają z tego samego stanu. */
export function DataProvider({ repositories, syncNow, children }: DataProviderProps) {
  const [books, setBooks] = useState<Book[] | null>(null);
  const [words, setWords] = useState<Word[] | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [metas, setMetas] = useState<Metas>(EMPTY_METAS);
  const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const online = useOnline();

  useEffect(() => {
    const track = (key: keyof Metas, meta: SnapshotMeta) => {
      setMetas((m) => ({ ...m, [key]: meta }));
      if (!meta.fromCache && !meta.hasPendingWrites) setLastSyncedAt(Date.now());
    };
    const onError = () => {
      setError(LOAD_ERROR);
    };
    const unsubscribers = [
      repositories.books.subscribe((value, meta) => {
        setBooks(value);
        track('books', meta);
      }, onError),
      repositories.words.subscribe((value, meta) => {
        setWords(value);
        track('words', meta);
      }, onError),
      repositories.settings.subscribe((value, meta) => {
        setSettings(value);
        track('settings', meta);
      }, onError),
    ];
    return () => {
      unsubscribers.forEach((unsubscribe) => {
        unsubscribe();
      });
    };
  }, [repositories]);

  // Zapis do Firestore kończy się dopiero po potwierdzeniu serwera, a offline nigdy —
  // interfejs nie czeka, bo lokalny cache od razu pokazuje zmianę w migawce.
  const write = useMemo(
    () => (promise: Promise<void>) => {
      promise.catch(() => {
        setError(SAVE_ERROR);
      });
    },
    [],
  );

  const metaList = useMemo(() => [metas.books, metas.words, metas.settings], [metas]);

  const value = useMemo<DataContextValue>(
    () => ({
      books,
      words,
      settings: settings ?? { ...DEFAULT_SETTINGS, theme: readCachedTheme(), updatedAt: null },
      sync: computeSyncStatus(metaList, online, lastSyncedAt),
      error,
      saveBook: (book) => {
        write(repositories.books.save(book));
      },
      removeBook: (id) => {
        write(repositories.books.remove(id));
      },
      saveWord: (word) => {
        write(repositories.words.save(word));
      },
      removeWord: (id) => {
        write(repositories.words.remove(id));
      },
      saveSettings: (next) => {
        write(repositories.settings.save(next));
      },
      syncNow,
    }),
    [books, words, settings, metaList, online, lastSyncedAt, error, repositories, syncNow, write],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}
