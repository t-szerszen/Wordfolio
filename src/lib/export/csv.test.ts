import { describe, expect, it } from 'vitest';
import type { Word } from '../data/models';
import { newSrs } from '../srs/scheduler';
import { wordsToCsv } from './csv';

const WORD: Word = {
  id: 'x',
  term: 'peeped',
  lang: 'en',
  translation: 'zerknęła, zajrzała ukradkiem',
  pos: 'czasownik',
  definition: 'Spojrzeć "szybko"',
  ipa: '/piːpt/',
  note: 'linia 1\nlinia 2',
  tags: ['matura', 'czasowniki'],
  status: 'learning',
  context: { sentence: '=SUMA(A1)', bookId: 'b', bookTitle: 'Alice', page: 3 },
  srs: newSrs(new Date(2026, 10, 17, 0, 30).getTime()),
  createdAt: new Date(2026, 10, 16, 0, 30).getTime(),
  updatedAt: null,
};

describe('wordsToCsv', () => {
  const csv = wordsToCsv([WORD]);
  const [header, row] = csv.replace('﻿', '').split('\r\n');

  it('zaczyna się od BOM i nagłówka rozdzielonego średnikami', () => {
    expect(csv.startsWith('﻿')).toBe(true);
    expect(header?.startsWith('słowo;tłumaczenie;część mowy')).toBe(true);
  });

  it('cytuje średniki, cudzysłowy i nowe linie', () => {
    expect(row).toContain(';zerknęła, zajrzała ukradkiem;');
    expect(row).toContain(';"Spojrzeć ""szybko""";');
    expect(csv).toContain('"linia 1\nlinia 2"');
    expect(wordsToCsv([{ ...WORD, note: 'a;b' }])).toContain('"a;b"');
  });

  it('neutralizuje formuły arkusza', () => {
    expect(row).toContain(";'=SUMA(A1);");
  });

  it('podaje daty w czasie lokalnym', () => {
    expect(row).toContain(';w nauce;en;');
    expect(row?.endsWith(';3;2026-11-16;2026-11-17')).toBe(true);
  });
});
