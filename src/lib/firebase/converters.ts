import {
  serverTimestamp,
  Timestamp,
  type FieldValue,
  type FirestoreDataConverter,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';
import {
  COVER_COLORS,
  COVER_MOTIFS,
  DEFAULT_SETTINGS,
  type Book,
  type Settings,
  type Word,
} from '../data/models';
import type { SrsState } from '../srs/types';
import {
  bool,
  fields,
  millis,
  num,
  numList,
  numOrNull,
  oneOf,
  str,
  strList,
  type Fields,
} from './parse';

type Stamp = Timestamp | FieldValue;

export type BookDoc = {
  title: string;
  author: string;
  lang: string;
  pageCount: number;
  fileHash: string;
  fileSize: number;
  color: string;
  motif: string;
  page: number;
  bookmarks: number[];
  lastOpenedAt: number | null;
  createdAt: Stamp;
  updatedAt: Stamp;
};

export type WordDoc = {
  term: string;
  lang: string;
  translation: string;
  pos: string;
  definition: string;
  ipa: string;
  note: string;
  tags: string[];
  status: string;
  context: { sentence: string; bookId: string | null; bookTitle: string; page: number | null };
  srs: SrsState;
  createdAt: Stamp;
  updatedAt: Stamp;
};

export type SettingsDoc = Omit<Settings, 'updatedAt'> & { updatedAt: Stamp };

/** Dokumenty zawsze zapisujemy w całości ze znacznikiem serwera — to podstawa last-write-wins. */
function createdStamp(createdAt: number | null): Stamp {
  return createdAt === null ? serverTimestamp() : Timestamp.fromMillis(createdAt);
}

function read(snapshot: QueryDocumentSnapshot): Fields {
  // „estimate” pokazuje lokalny czas dla zapisów, które jeszcze nie dotarły do serwera.
  return fields(snapshot.data({ serverTimestamps: 'estimate' }));
}

export const bookConverter: FirestoreDataConverter<Book, BookDoc> = {
  toFirestore(book: Book): BookDoc {
    return {
      title: book.title,
      author: book.author,
      lang: book.lang,
      pageCount: book.pageCount,
      fileHash: book.id,
      fileSize: book.fileSize,
      color: book.color,
      motif: book.motif,
      page: book.page,
      bookmarks: book.bookmarks,
      lastOpenedAt: book.lastOpenedAt,
      createdAt: createdStamp(book.createdAt),
      updatedAt: serverTimestamp(),
    };
  },
  fromFirestore(snapshot): Book {
    const d = read(snapshot);
    return {
      id: snapshot.id,
      title: str(d.title, 'Bez tytułu'),
      author: str(d.author),
      lang: str(d.lang),
      pageCount: num(d.pageCount, 1),
      fileSize: num(d.fileSize),
      color: oneOf(d.color, COVER_COLORS, 'clay'),
      motif: oneOf(d.motif, COVER_MOTIFS, 'key'),
      page: num(d.page, 1),
      bookmarks: numList(d.bookmarks),
      lastOpenedAt: numOrNull(d.lastOpenedAt),
      createdAt: millis(d.createdAt),
      updatedAt: millis(d.updatedAt),
    };
  },
};

function readSrs(value: unknown): SrsState {
  const s = fields(value);
  return {
    phase: oneOf(s.phase, ['new', 'learning', 'review', 'relearning'] as const, 'new'),
    due: num(s.due),
    intervalDays: num(s.intervalDays),
    ease: num(s.ease, 2.5),
    reps: num(s.reps),
    lapses: num(s.lapses),
    step: num(s.step),
    lastReviewedAt: numOrNull(s.lastReviewedAt),
  };
}

export const wordConverter: FirestoreDataConverter<Word, WordDoc> = {
  toFirestore(word: Word): WordDoc {
    return {
      term: word.term,
      lang: word.lang,
      translation: word.translation,
      pos: word.pos,
      definition: word.definition,
      ipa: word.ipa,
      note: word.note,
      tags: word.tags,
      status: word.status,
      context: {
        sentence: word.context.sentence,
        bookId: word.context.bookId,
        bookTitle: word.context.bookTitle,
        page: word.context.page,
      },
      srs: { ...word.srs },
      createdAt: createdStamp(word.createdAt),
      updatedAt: serverTimestamp(),
    };
  },
  fromFirestore(snapshot): Word {
    const d = read(snapshot);
    const context = fields(d.context);
    const bookId = context.bookId;
    return {
      id: snapshot.id,
      term: str(d.term),
      lang: str(d.lang),
      translation: str(d.translation),
      pos: str(d.pos),
      definition: str(d.definition),
      ipa: str(d.ipa),
      note: str(d.note),
      tags: strList(d.tags),
      status: oneOf(d.status, ['new', 'learning', 'known'] as const, 'new'),
      context: {
        sentence: str(context.sentence),
        bookId: typeof bookId === 'string' ? bookId : null,
        bookTitle: str(context.bookTitle),
        page: numOrNull(context.page),
      },
      srs: readSrs(d.srs),
      createdAt: millis(d.createdAt),
      updatedAt: millis(d.updatedAt),
    };
  },
};

export const settingsConverter: FirestoreDataConverter<Settings, SettingsDoc> = {
  toFirestore(settings: Settings): SettingsDoc {
    return {
      theme: settings.theme,
      fontSize: settings.fontSize,
      lineHeight: settings.lineHeight,
      margins: settings.margins,
      showSavedWords: settings.showSavedWords,
      bookLang: settings.bookLang,
      targetLang: settings.targetLang,
      reviewDays: settings.reviewDays,
      updatedAt: serverTimestamp(),
    };
  },
  fromFirestore(snapshot): Settings {
    const d = read(snapshot);
    const base = DEFAULT_SETTINGS;
    return {
      theme: oneOf(d.theme, ['papier', 'lampka', 'system'] as const, base.theme),
      fontSize: num(d.fontSize, base.fontSize),
      lineHeight: num(d.lineHeight, base.lineHeight),
      margins: oneOf(d.margins, ['narrow', 'medium', 'wide'] as const, base.margins),
      showSavedWords: bool(d.showSavedWords, base.showSavedWords),
      bookLang: str(d.bookLang, base.bookLang),
      targetLang: str(d.targetLang, base.targetLang),
      reviewDays: strList(d.reviewDays),
      updatedAt: millis(d.updatedAt),
    };
  },
};
