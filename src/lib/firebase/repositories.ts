import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  setDoc,
  type Firestore,
  type FirestoreDataConverter,
  type DocumentData,
} from 'firebase/firestore';
import type { Book, Settings, Word } from '../data/models';
import type {
  BooksRepository,
  CollectionRepository,
  SettingsRepository,
  WordsRepository,
} from '../data/repositories';
import { bookConverter, settingsConverter, wordConverter } from './converters';

function collectionRepository<T extends { id: string }, D extends DocumentData>(
  db: Firestore,
  uid: string,
  name: string,
  converter: FirestoreDataConverter<T, D>,
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
    save(item) {
      return setDoc(doc(ref, item.id), item);
    },
    remove(id) {
      return deleteDoc(doc(ref, id));
    },
  };
}

export function firestoreBooks(db: Firestore, uid: string): BooksRepository {
  return collectionRepository<Book, DocumentData>(db, uid, 'books', bookConverter);
}

export function firestoreWords(db: Firestore, uid: string): WordsRepository {
  return collectionRepository<Word, DocumentData>(db, uid, 'words', wordConverter);
}

export function firestoreSettings(db: Firestore, uid: string): SettingsRepository {
  const ref = doc(db, 'users', uid, 'settings', 'main').withConverter(settingsConverter);
  return {
    subscribe(onChange, onError) {
      return onSnapshot(
        ref,
        { includeMetadataChanges: true },
        (snapshot) => {
          onChange(snapshot.exists() ? snapshot.data() : null, snapshot.metadata);
        },
        onError,
      );
    },
    save(settings: Settings) {
      return setDoc(ref, settings);
    },
  };
}
