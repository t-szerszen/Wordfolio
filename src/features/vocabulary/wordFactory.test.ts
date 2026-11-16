import { describe, expect, it } from 'vitest';
import { createWord, dictionaryForm, wordIdFor } from './wordFactory';

describe('wordIdFor', () => {
  it('daje ten sam identyfikator niezależnie od wielkości liter i odmiany języka', async () => {
    const a = await wordIdFor('Peeped', 'en-GB');
    const b = await wordIdFor('peeped', 'en');
    expect(a).toBe(b);
    expect(a).toMatch(/^[0-9a-f]{40}$/);
  });

  it('odróżnia to samo słowo w innych językach', async () => {
    expect(await wordIdFor('die', 'en')).not.toBe(await wordIdFor('die', 'de'));
  });
});

describe('dictionaryForm', () => {
  it('zmniejsza wielką literę na początku zdania', () => {
    expect(dictionaryForm('Once', '', 'en')).toBe('once');
    expect(dictionaryForm('Once', '‘', 'en')).toBe('once');
  });

  it('zostawia nazwy własne w środku zdania i niemieckie rzeczowniki', () => {
    expect(dictionaryForm('Alice', 'thought ', 'en')).toBe('Alice');
    expect(dictionaryForm('Ungeziefer', '', 'de')).toBe('Ungeziefer');
    expect(dictionaryForm('NASA', '', 'en')).toBe('NASA');
  });
});

describe('createWord', () => {
  it('buduje nowe słówko z kontekstem i świeżym harmonogramem', () => {
    const word = createWord({
      id: 'x',
      term: 'peeped',
      lang: 'en-GB',
      sentence: 'once or twice she had peeped into the book',
      book: { id: 'b'.repeat(64), title: 'Alice' },
      page: 3,
      translation: {
        translation: 'zerknęła',
        partOfSpeech: 'czasownik',
        definition: '',
        ipa: '/piːpt/',
      },
      now: 1000,
    });
    expect(word).toMatchObject({
      lang: 'en',
      translation: 'zerknęła',
      pos: 'czasownik',
      status: 'new',
      context: { page: 3, bookTitle: 'Alice' },
      srs: { phase: 'new', due: 1000 },
      createdAt: null,
    });
  });
});
