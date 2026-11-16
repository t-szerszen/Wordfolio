import { createContext } from 'react';
import type { Book, Settings, SettingsInput, Word } from '../lib/data/models';
import type { SyncStatus } from '../lib/data/syncStatus';

export type DataMutations = {
  /** Dodaje książkę; jeśli ten sam plik jest już na serwerze, zostaje jego wersja. */
  createBook: (book: Book) => void;
  saveBook: (book: Book) => void;
  /** Dodaje słówko; jeśli już istnieje (np. z innego urządzenia), zostaje jego wersja z postępami. */
  createWord: (word: Word) => void;
  saveWord: (word: Word) => void;
  removeWord: (id: string) => void;
  updateSettings: (patch: Partial<Omit<SettingsInput, 'reviewDays'>>) => void;
  addReviewDay: (day: string) => void;
  syncNow: () => Promise<void>;
};

export type DataContextValue = DataMutations & {
  books: Book[] | null;
  words: Word[] | null;
  settings: Settings;
  sync: SyncStatus;
  error: string | null;
};

export const DataContext = createContext<DataContextValue | null>(null);
