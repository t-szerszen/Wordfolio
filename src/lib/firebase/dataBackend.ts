import type { FirebaseApp } from 'firebase/app';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  type Firestore,
} from 'firebase/firestore';
import type { BooksRepository, SettingsRepository, WordsRepository } from '../data/repositories';
import { firestoreBooks, firestoreSettings, firestoreWords } from './repositories';
import { syncNow } from './sync';

export type Repositories = {
  books: BooksRepository;
  words: WordsRepository;
  settings: SettingsRepository;
};

export type DataBackend = {
  repositories: (uid: string) => Repositories;
  syncNow: () => Promise<void>;
};

let db: Firestore | null = null;

/**
 * Firestore (największa część paczki) ładujemy dopiero po zalogowaniu, żeby ekran logowania
 * nie czekał na kod, którego jeszcze nie potrzebuje.
 */
export function createDataBackend(app: FirebaseApp): DataBackend {
  // Trwały cache z obsługą wielu kart: czytanie, powtórki i zapis słówek działają offline,
  // a zmiany dosyłają się po powrocie sieci.
  db ??= initializeFirestore(app, {
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
  });
  const firestore = db;
  return {
    repositories: (uid) => ({
      books: firestoreBooks(firestore, uid),
      words: firestoreWords(firestore, uid),
      settings: firestoreSettings(firestore, uid),
    }),
    syncNow: () => syncNow(firestore),
  };
}
