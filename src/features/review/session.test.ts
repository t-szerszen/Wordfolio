import { describe, expect, it } from 'vitest';
import type { Word } from '../../lib/data/models';
import { DAY, MINUTE, newSrs } from '../../lib/srs/scheduler';
import { answer, forecast, startExtraSession, startSession } from './session';

const NOW = new Date(2026, 10, 16, 18, 0).getTime();

function word(id: string, due: number, createdAt = NOW - 10 * DAY): Word {
  return {
    id,
    term: id,
    lang: 'en',
    translation: '',
    pos: '',
    definition: '',
    ipa: '',
    note: '',
    tags: [],
    status: 'new',
    context: { sentence: '', bookId: null, bookTitle: '', page: null },
    srs: { ...newSrs(due), due },
    createdAt,
    updatedAt: null,
  };
}

describe('sesja powtórek', () => {
  const first = word('a', NOW - 2 * DAY);
  const words = [first, word('b', NOW - DAY), word('later', NOW + 3 * DAY)];

  it('bierze tylko karty do powtórki, od najstarszego terminu', () => {
    expect(startSession(words, NOW)).toMatchObject({ queue: ['a', 'b'], total: 2, done: 0 });
  });

  it('„Dobrze” zdejmuje kartę z kolejki i aktualizuje status', () => {
    const session = startSession(words, NOW);
    const result = answer(session, first, 'good', NOW);
    expect(result.session).toMatchObject({ queue: ['b'], done: 1, tally: { good: 1 } });
    expect(result.word.status).toBe('learning');
    expect(result.word.srs.due).toBe(NOW + DAY);
  });

  it('„Jeszcze raz” odkłada kartę na koniec tej samej sesji', () => {
    const session = startSession(words, NOW);
    const result = answer(session, first, 'again', NOW);
    expect(result.session).toMatchObject({ queue: ['b', 'a'], done: 0, tally: { again: 1 } });
    expect(result.word.srs.due).toBe(NOW + MINUTE);
  });

  it('„Jeszcze 5 kart” bierze najbliższe niezaległe karty', () => {
    const many = Array.from({ length: 8 }, (_, i) => word(`w${i}`, NOW + (8 - i) * DAY));
    expect(startExtraSession(many, NOW).queue).toEqual(['w7', 'w6', 'w5', 'w4', 'w3']);
  });
});

describe('forecast', () => {
  it('liczy karty na jutro i te dodane dziś', () => {
    const tomorrow = NOW + DAY;
    const words = [
      word('a', tomorrow),
      word('b', tomorrow, NOW - MINUTE),
      word('c', NOW + 5 * DAY),
    ];
    expect(forecast(words, NOW)).toEqual({ tomorrow: 2, fromToday: 1 });
  });
});
