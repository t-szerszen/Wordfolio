import { describe, expect, it } from 'vitest';
import { sentenceAround, sentenceText } from './sentence';

const PARAGRAPH =
  'Alice was beginning to get very tired of sitting by her sister on the bank. Once or twice she had peeped into the book her sister was reading. It had no pictures.';

describe('sentenceAround', () => {
  it('zwraca zdanie zawierające słowo z podziałem wokół niego', () => {
    const start = PARAGRAPH.indexOf('peeped');
    const context = sentenceAround(PARAGRAPH, start, start + 6, 'en');
    expect(context).toEqual({
      before: 'Once or twice she had ',
      match: 'peeped',
      after: ' into the book her sister was reading.',
    });
    expect(sentenceText(context).trim()).toBe(
      'Once or twice she had peeped into the book her sister was reading.',
    );
  });

  it('obsługuje słowo na początku akapitu', () => {
    const context = sentenceAround(PARAGRAPH, 0, 5, 'en');
    expect(context.before).toBe('');
    expect(context.match).toBe('Alice');
  });

  it('przycina bardzo długie zdanie wokół słowa', () => {
    const long = `${'word '.repeat(200)}target ${'tail '.repeat(200)}end.`;
    const start = long.indexOf('target');
    const context = sentenceAround(long, start, start + 6, 'en');
    expect(sentenceText(context).length).toBeLessThan(340);
    expect(context.before.startsWith('…')).toBe(true);
    expect(context.after.endsWith('…')).toBe(true);
    expect(context.match).toBe('target');
  });
});
