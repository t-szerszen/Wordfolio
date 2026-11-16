import { FirebaseError } from 'firebase/app';
import {
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDocFromServer,
  onSnapshot,
  serverTimestamp,
  setDoc,
  type DocumentReference,
  type Firestore,
  type FirestoreDataConverter,
} from 'firebase/firestore';
import type { Book, Word } from '../data/models';
import type {
  BooksRepository,
  CollectionRepository,
  SettingsRepository,
  WordsRepository,
} from '../data/repositories';
import { bookConverter, settingsConverter, wordConverter } from './converters';

/**
 * Utworzenie dokumentu, który już istnieje na serwerze, reguły odrzucają (createdAt musiałby się
 * zmienić). Wtedy po prostu zostaje wersja z serwera — to nie jest błąd dla użytkownika.
 */
async function createOnly<T>(ref: DocumentReference<T>, item: T): Promise<void> {
  try {
    await setDoc(ref, item);
  } catch (error) {
    if (error instanceof FirebaseError && error.code === 'permission-denied') {
      const existing = await getDocFromServer(ref).catch(() => null);
      if (existing?.exists()) return;
    }
    throw error;
  }
}

function collectionRepository<T extends { id: string }>(
  db: Firestore,
  uid: string,
  name: string,
  converter: FirestoreDataConverter<T>,
): CollectionRepository<T> {
  const ref = collection(db, 'users', uid, name).withConverter(converter);
  return {
    subscribe(onChange, onError) {
      return onSnapshot(
        ref,
        { includeMetadataChanges: true },
        (snapshot) => {
          onChange(
            snapshot.docs.map((d) => d.data()),
            snapshot.metadata,
          );
        },
        onError,
      );
    },
    create: (item) => createOnly(doc(ref, item.id), item),
    update: (item) => setDoc(doc(ref, item.id), item, { merge: true }),
    remove: (id) => deleteDoc(doc(ref, id)),
  };
}

export function firestoreBooks(db: Firestore, uid: string): BooksRepository {
  return collectionRepository<Book>(db, uid, 'books', bookConverter);
}

export function firestoreWords(db: Firestore, uid: string): WordsRepository {
  return collectionRepository<Word>(db, uid, 'words', wordConverter);
}

export function firestoreSettings(db: Firestore, uid: string): SettingsRepository {
  const ref = doc(db, 'users', uid, 'settings', 'main');
  return {
    subscribe(onChange, onError) {
      return onSnapshot(
        ref.withConverter(settingsConverter),
        { includeMetadataChanges: true },
        (snapshot) => {
          onChange(snapshot.exists() ? snapshot.data() : null, snapshot.metadata);
        },
        onError,
      );
    },
    save: (settings, addDays) =>
      setDoc(
        ref,
        { ...settings, reviewDays: arrayUnion(...addDays), updatedAt: serverTimestamp() },
        { merge: true },
      ),
  };
}
