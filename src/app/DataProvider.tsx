import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { readCachedTheme } from '../features/settings/theme';
import { DataContext, type DataContextValue, type DataMutations } from '../hooks/dataContext';
import { useOnline } from '../hooks/useOnline';
import {
  DEFAULT_SETTINGS,
  type Book,
  type Settings,
  type SettingsInput,
  type Word,
} from '../lib/data/models';
import type { SnapshotMeta } from '../lib/data/repositories';
import { computeSyncStatus } from '../lib/data/syncStatus';
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

type SettingsContent = Omit<SettingsInput, 'reviewDays'>;

const EMPTY_METAS: Metas = { books: null, words: null, settings: null };
const LOAD_ERROR = 'Nie udało się wczytać danych. Sprawdź połączenie i reguły Firestore.';
const SAVE_ERROR = 'Serwer odrzucił ostatnią zmianę, więc została cofnięta. Spróbuj ponownie.';

function defaults(): Settings {
  return { ...DEFAULT_SETTINGS, theme: readCachedTheme(), updatedAt: null };
}

function contentOf(s: Settings): SettingsContent {
  return {
    theme: s.theme,
    fontSize: s.fontSize,
    lineHeight: s.lineHeight,
    margins: s.margins,
    showSavedWords: s.showSavedWords,
    bookLang: s.bookLang,
    targetLang: s.targetLang,
  };
}

type PendingSettings = {
  ready: boolean;
  current: Settings;
  patch: Partial<SettingsContent>;
  days: string[];
};

/** Jeden nasłuch na każdą kolekcję — wszystkie ekrany czytają z tego samego stanu. */
export function DataProvider({ repositories, syncNow, children }: DataProviderProps) {
  const [books, setBooks] = useState<Book[] | null>(null);
  const [words, setWords] = useState<Word[] | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [pendingSettings, setPendingSettings] = useState<Partial<SettingsContent>>({});
  const [metas, setMetas] = useState<Metas>(EMPTY_METAS);
  const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const online = useOnline();

  // Ustawień nie wolno zapisać, zanim wiadomo, co jest na serwerze — inaczej domyślne wartości
  // z nowego urządzenia nadpisałyby prawdziwe. Do tego czasu zmiany czekają w kolejce.
  const settingsState = useRef<PendingSettings>({
    ready: false,
    current: defaults(),
    patch: {},
    days: [],
  });

  // Zapis do Firestore kończy się dopiero po potwierdzeniu serwera, a offline nigdy —
  // interfejs nie czeka, bo lokalny cache od razu pokazuje zmianę w migawce.
  const write = useMemo(
    () => (promise: Promise<void>) => {
      promise.then(
        () => {
          setError((current) => (current === SAVE_ERROR ? null : current));
        },
        () => {
          setError(SAVE_ERROR);
        },
      );
    },
    [],
  );

  useEffect(() => {
    const state = settingsState.current;
    const flushSettings = () => {
      if (!state.ready || (Object.keys(state.patch).length === 0 && state.days.length === 0))
        return;
      write(
        repositories.settings.save({ ...contentOf(state.current), ...state.patch }, state.days),
      );
      state.patch = {};
      state.days = [];
      setPendingSettings({});
    };
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
        state.current = value ?? { ...defaults(), reviewDays: state.current.reviewDays };
        state.ready = value !== null || !meta.fromCache;
        flushSettings();
      }, onError),
    ];
    return () => {
      unsubscribers.forEach((unsubscribe) => {
        unsubscribe();
      });
    };
  }, [repositories, write]);

  const mutations = useMemo<DataMutations>(() => {
    const state = settingsState.current;
    const saveSettings = (patch: Partial<SettingsContent>, days: readonly string[]) => {
      if (state.ready) {
        write(repositories.settings.save({ ...contentOf(state.current), ...patch }, days));
        return;
      }
      state.patch = { ...state.patch, ...patch };
      state.days = [...new Set([...state.days, ...days])];
      setPendingSettings(state.patch);
    };
    return {
      createBook: (book) => {
        write(repositories.books.create(book));
      },
      saveBook: (book) => {
        write(repositories.books.update(book));
      },
      createWord: (word) => {
        write(repositories.words.create(word));
      },
      saveWord: (word) => {
        write(repositories.words.update(word));
      },
      removeWord: (id) => {
        write(repositories.words.remove(id));
      },
      updateSettings: (patch) => {
        saveSettings(patch, []);
      },
      addReviewDay: (day) => {
        saveSettings({}, [day]);
      },
      syncNow,
    };
  }, [repositories, write, syncNow]);

  const metaList = useMemo(() => [metas.books, metas.words, metas.settings], [metas]);

  const value = useMemo<DataContextValue>(
    () => ({
      books,
      words,
      settings: { ...(settings ?? defaults()), ...pendingSettings },
      sync: computeSyncStatus(metaList, online, lastSyncedAt),
      error,
      ...mutations,
    }),
    [books, words, settings, pendingSettings, metaList, online, lastSyncedAt, error, mutations],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}
