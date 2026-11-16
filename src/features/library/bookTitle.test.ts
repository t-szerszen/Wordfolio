import { describe, expect, it } from 'vitest';
import { bookTitle } from './bookTitle';

describe('bookTitle', () => {
  it('bierze tytuł z metadanych, gdy jest sensowny', () => {
    expect(bookTitle('Alice’s Adventures in Wonderland', 'alice.pdf')).toBe(
      'Alice’s Adventures in Wonderland',
    );
  });

  it('pomija techniczne tytuły i używa nazwy pliku', () => {
    expect(bookTitle('Microsoft Word - draft.docx', 'Die_Verwandlung.pdf')).toBe('Die Verwandlung');
    expect(bookTitle('', 'Le Petit Prince.PDF')).toBe('Le Petit Prince');
    expect(bookTitle('untitled', '.pdf')).toBe('Bez tytułu');
  });
});
