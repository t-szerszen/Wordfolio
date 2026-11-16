import type { FirebaseOptions } from 'firebase/app';
import type {
  BooksRepository,
  SettingsRepository,
  WordsRepository,
} from '../lib/data/repositories';
import {
  completeRedirect,
  signInWithGoogle,
  signOutUser,
  watchAuth,
  type AuthUser,
} from '../lib/firebase/auth';
import { firestoreBooks, firestoreSettings, firestoreWords } from '../lib/firebase/repositories';
import { initFirebase } from '../lib/firebase/services';
import { syncNow } from '../lib/firebase/sync';

export type Repositories = {
  books: BooksRepository;
  words: WordsRepository;
  settings: SettingsRepository;
};

export type AuthBackend = {
  watch(onChange: (user: AuthUser | null) => void): () => void;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  completeRedirect: () => Promise<unknown>;
};

/** Jedyne miejsce, które łączy Firebase z resztą aplikacji. */
export type Backend = {
  auth: AuthBackend;
  repositories: (uid: string) => Repositories;
  syncNow: () => Promise<void>;
};

export function createFirebaseBackend(options: FirebaseOptions): Backend {
  const { auth, db } = initFirebase(options);
  return {
    auth: {
      watch: (onChange) => watchAuth(auth, onChange),
      signIn: () => signInWithGoogle(auth),
      signOut: () => signOutUser(auth),
      completeRedirect: () => completeRedirect(auth),
    },
    repositories: (uid) => ({
      books: firestoreBooks(db, uid),
      words: firestoreWords(db, uid),
      settings: firestoreSettings(db, uid),
    }),
    syncNow: () => syncNow(db),
  };
}
