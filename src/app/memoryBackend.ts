import type { Book, Settings, Word } from '../lib/data/models';
import type {
  CollectionRepository,
  Listener,
  SettingsRepository,
  SnapshotMeta,
} from '../lib/data/repositories';
import type { AuthUser } from '../lib/firebase/auth';
import type { Backend } from './backend';

/**
 * Backend tylko do `npm run dev` bez kluczy Firebase: dane w localStorage,
 * „synchronizacja” między kartami przez zdarzenie storage.
 */
const SERVER: SnapshotMeta = { fromCache: false, hasPendingWrites: false };
const USER: AuthUser = {
  uid: 'local-dev',
  displayName: 'Tryb lokalny',
  email: 'lokalnie@wordfolio',
};
const USER_KEY = 'wordfolio:dev:user';

function storageKey(uid: string, name: string): string {
  return `wordfolio:dev:${uid}:${name}`;
}

function load<T>(key: string): Record<string, T> {
  try {
    return JSON.parse(localStorage.getItem(key) ?? '{}') as Record<string, T>;
  } catch {
    return {};
  }
}

function watchKey(key: string, emit: () => void): () => void {
  const onStorage = (event: StorageEvent) => {
    if (event.key === key) emit();
  };
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener('storage', onStorage);
  };
}

function collectionStore<
  T extends { id: string; createdAt: number | null; updatedAt: number | null },
>(key: string): CollectionRepository<T> {
  const listeners = new Set<Listener<T[]>>();
  const emit = () => {
    const items = Object.values(load<T>(key));
    listeners.forEach((listener) => {
      listener(items, SERVER);
    });
  };
  const write = (items: Record<string, T>) => {
    localStorage.setItem(key, JSON.stringify(items));
    emit();
    return Promise.resolve();
  };
  return {
    subscribe: (onChange) => {
      listeners.add(onChange);
      onChange(Object.values(load<T>(key)), SERVER);
      const stop = watchKey(key, emit);
      return () => {
        listeners.delete(onChange);
        stop();
      };
    },
    save: (item) => {
      const now = Date.now();
      return write({
        ...load<T>(key),
        [item.id]: { ...item, createdAt: item.createdAt ?? now, updatedAt: now },
      });
    },
    remove: (id) => {
      return write(Object.fromEntries(Object.entries(load<T>(key)).filter(([k]) => k !== id)));
    },
  };
}

function settingsStore(key: string): SettingsRepository {
  const listeners = new Set<Listener<Settings | null>>();
  const read = () => load<Settings>(key).main ?? null;
  const emit = () => {
    listeners.forEach((listener) => {
      listener(read(), SERVER);
    });
  };
  return {
    subscribe: (onChange) => {
      listeners.add(onChange);
      onChange(read(), SERVER);
      const stop = watchKey(key, emit);
      return () => {
        listeners.delete(onChange);
        stop();
      };
    },
    save: (settings) => {
      localStorage.setItem(key, JSON.stringify({ main: { ...settings, updatedAt: Date.now() } }));
      emit();
      return Promise.resolve();
    },
  };
}

export function createMemoryBackend(): Backend {
  const authListeners = new Set<(user: AuthUser | null) => void>();
  const current = () => (localStorage.getItem(USER_KEY) ? USER : null);
  const setUser = (signedIn: boolean) => {
    if (signedIn) localStorage.setItem(USER_KEY, '1');
    else localStorage.removeItem(USER_KEY);
    authListeners.forEach((listener) => {
      listener(current());
    });
    return Promise.resolve();
  };
  return {
    auth: {
      watch: (onChange) => {
        authListeners.add(onChange);
        onChange(current());
        return () => authListeners.delete(onChange);
      },
      signIn: () => setUser(true),
      signOut: () => setUser(false),
      completeRedirect: () => Promise.resolve(null),
    },
    loadData: () =>
      Promise.resolve({
        repositories: (uid: string) => ({
          books: collectionStore<Book>(storageKey(uid, 'books')),
          words: collectionStore<Word>(storageKey(uid, 'words')),
          settings: settingsStore(storageKey(uid, 'settings')),
        }),
        syncNow: () => Promise.resolve(),
      }),
  };
}
