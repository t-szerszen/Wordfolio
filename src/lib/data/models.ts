import type { SrsState } from '../srs/types';

export type ThemeChoice = 'papier' | 'lampka' | 'system';
export type MarginSize = 'narrow' | 'medium' | 'wide';
export type WordStatus = 'new' | 'learning' | 'known';

export const COVER_COLORS = [
  'clay',
  'sage',
  'ochre',
  'rose',
  'slate',
  'plum',
  'ink',
  'linen',
  'honey',
] as const;
export type CoverColor = (typeof COVER_COLORS)[number];

export const COVER_MOTIFS = [
  'key',
  'leaf',
  'star',
  'moon',
  'wave',
  'flower',
  'mountain',
  'sun',
] as const;
export type CoverMotif = (typeof COVER_MOTIFS)[number];

export type Book = {
  /** Skrót SHA-256 pliku — ten sam PDF ma ten sam identyfikator na każdym urządzeniu. */
  id: string;
  title: string;
  author: string;
  lang: string;
  pageCount: number;
  fileSize: number;
  color: CoverColor;
  motif: CoverMotif;
  page: number;
  bookmarks: number[];
  lastOpenedAt: number | null;
  createdAt: number | null;
  updatedAt: number | null;
};

export type WordContext = {
  sentence: string;
  bookId: string | null;
  bookTitle: string;
  page: number | null;
};

export type Word = {
  id: string;
  term: string;
  lang: string;
  translation: string;
  pos: string;
  definition: string;
  ipa: string;
  note: string;
  tags: string[];
  status: WordStatus;
  context: WordContext;
  srs: SrsState;
  createdAt: number | null;
  updatedAt: number | null;
};

export type Settings = {
  theme: ThemeChoice;
  fontSize: number;
  lineHeight: number;
  margins: MarginSize;
  showSavedWords: boolean;
  bookLang: string;
  targetLang: string;
  /** Dni z ukończoną powtórką (RRRR-MM-DD, czas lokalny) — źródło serii „dni z rzędu”. */
  reviewDays: string[];
  updatedAt: number | null;
};

export type SettingsInput = Omit<Settings, 'updatedAt'>;

export const DEFAULT_SETTINGS: SettingsInput = {
  theme: 'system',
  fontSize: 19,
  lineHeight: 1.62,
  margins: 'medium',
  showSavedWords: true,
  bookLang: 'auto',
  targetLang: 'pl',
  reviewDays: [],
};
