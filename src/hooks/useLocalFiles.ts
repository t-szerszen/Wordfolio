import { useEffect, useSyncExternalStore } from 'react';
import { listFileIds } from '../lib/storage/localStore';

/** Które książki mają plik PDF na tym urządzeniu — wspólny stan dla wszystkich ekranów. */
let ids: ReadonlySet<string> | null = null;
const listeners = new Set<() => void>();

export function refreshLocalFiles(): Promise<void> {
  return listFileIds().then((list) => {
    ids = new Set(list);
    listeners.forEach((listener) => {
      listener();
    });
  });
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useLocalFiles(): { ready: boolean; has: (bookId: string) => boolean } {
  const snapshot = useSyncExternalStore(subscribe, () => ids);
  useEffect(() => {
    if (ids === null) void refreshLocalFiles();
  }, []);
  return { ready: snapshot !== null, has: (bookId) => snapshot?.has(bookId) ?? false };
}
