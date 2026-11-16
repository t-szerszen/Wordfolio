import { createContext } from 'react';
import type { Book, Settings, Word } from '../lib/data/models';
import type { SyncStatus } from '../lib/data/syncStatus';

export type DataContextValue = {
  books: Book[] | null;
  words: Word[] | null;
  settings: Settings;
  sync: SyncStatus;
  error: string | null;
  saveBook: (book: Book) => void;
  removeBook: (id: string) => void;
  saveWord: (word: Word) => void;
  removeWord: (id: string) => void;
  saveSettings: (settings: Settings) => void;
  syncNow: () => Promise<void>;
};

export const DataContext = createContext<DataContextValue | null>(null);
