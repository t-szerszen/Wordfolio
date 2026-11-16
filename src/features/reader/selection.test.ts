import { describe, expect, it } from 'vitest';
import { tokenize } from '../../lib/text/tokenize';
import { isPhrase, moveEdge, selectionRange } from './selection';

const TEXT = 'nor did Alice think it so very much out of the way to hear';
const tokens = tokenize(TEXT, 'en');
const index = (word: string) => tokens.findIndex((t) => t.text === word);

describe('zaznaczenie', () => {
  it('wyznacza fragment tekstu wyrażenia', () => {
    const selection = { paragraph: 0, start: index('out'), end: index('way') };
    const { from, to } = selectionRange(tokens, selection);
    expect(TEXT.slice(from, to)).toBe('out of the way');
    expect(isPhrase(selection)).toBe(true);
  });

  it('pojedyncze słowo nie jest wyrażeniem', () => {
    expect(isPhrase({ paragraph: 0, start: 4, end: 4 })).toBe(false);
  });

  it('nie pozwala przesunąć początku za koniec', () => {
    const selection = { paragraph: 0, start: index('out'), end: index('way') };
    expect(moveEdge(selection, 'start', index('hear'))).toEqual({
      ...selection,
      start: selection.end,
    });
    expect(moveEdge(selection, 'end', index('Alice'))).toEqual({
      ...selection,
      end: selection.start,
    });
    expect(moveEdge(selection, 'start', index('much')).start).toBe(index('much'));
  });
});
