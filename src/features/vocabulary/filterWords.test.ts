import { describe, expect, it } from 'vitest';
import type { Word } from '../../lib/data/models';
import { newSrs } from '../../lib/srs/scheduler';
import { filterWords, foldText, topTags } from './filterWords';

function word(term: string, overrides: Partial<Word> = {}): Word {
  return {
    id: term,
    term,
    lang: 'en',
    translation: '',
    pos: '',
    definition: '',
    ipa: '',
    note: '',
    tags: [],
    status: 'new',
    context: { sentence: '', bookId: 'alice', bookTitle: 'Alice', page: 1 },
    srs: newSrs(0),
    createdAt: 0,
    updatedAt: 0,
    ...overrides,
  };
}

const WORDS = [
  word('peeped', { translation: 'zerknęła', createdAt: 3, tags: ['czasowniki', 'matura'] }),
  word('bank', { translation: 'brzeg', status: 'learning', createdAt: 2, tags: ['matura'] }),
  word('Ungeziefer', {
    lang: 'de',
    translation: 'robactwo',
    status: 'known',
    createdAt: 1,
    context: { sentence: '', bookId: 'kafka', bookTitle: 'Kafka', page: 1 },
  }),
];

const ALL = { query: '', status: 'all', bookId: null, tags: [] } as const;

describe('filterWords', () => {
  it('sortuje od ostatnio dodanych albo alfabetycznie', () => {
    expect(filterWords(WORDS, ALL, 'recent').map((w) => w.term)).toEqual([
      'peeped',
      'bank',
      'Ungeziefer',
    ]);
    expect(filterWords(WORDS, ALL, 'az').map((w) => w.term)).toEqual([
      'bank',
      'peeped',
      'Ungeziefer',
    ]);
  });

  it('szuka w słowie i tłumaczeniu bez polskich znaków', () => {
    expect(filterWords(WORDS, { ...ALL, query: 'zerknela' }, 'recent').map((w) => w.term)).toEqual([
      'peeped',
    ]);
    expect(filterWords(WORDS, { ...ALL, query: 'UNGE' }, 'recent')).toHaveLength(1);
  });

  it('filtruje po statusie, książce i etykietach', () => {
    expect(filterWords(WORDS, { ...ALL, status: 'learning' }, 'recent').map((w) => w.term)).toEqual(
      ['bank'],
    );
    expect(filterWords(WORDS, { ...ALL, bookId: 'kafka' }, 'recent').map((w) => w.term)).toEqual([
      'Ungeziefer',
    ]);
    expect(
      filterWords(WORDS, { ...ALL, tags: ['matura', 'czasowniki'] }, 'recent').map((w) => w.term),
    ).toEqual(['peeped']);
  });
});

describe('foldText', () => {
  it('usuwa znaki diakrytyczne', () => {
    expect(foldText('Zażółć GĘŚLĄ jaźń')).toBe('zazolc gesla jazn');
  });
});

describe('topTags', () => {
  it('zwraca najczęstsze etykiety', () => {
    expect(topTags(WORDS, 1)).toEqual(['matura']);
  });
});
