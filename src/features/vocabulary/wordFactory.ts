import type { Book, Word } from '../../lib/data/models';
import { sha1Hex } from '../../lib/hash';
import { baseLanguage } from '../../lib/language/names';
import { newSrs } from '../../lib/srs/scheduler';
import { normalizeTerm } from '../../lib/text/tokenize';
import type { TranslationResult } from '../../lib/translation';

/** To samo słowo w tym samym języku ma ten sam identyfikator na każdym urządzeniu. */
export function wordIdFor(term: string, lang: string): Promise<string> {
  return sha1Hex(`${baseLanguage(lang)}\u0000${normalizeTerm(term, lang)}`);
}

/**
 * Słowo z początku zdania zapisujemy małą literą („Once” → „once”), chyba że to niemiecki,
 * gdzie wielka litera niesie znaczenie (rzeczowniki).
 */
export function dictionaryForm(term: string, sentenceBefore: string, lang: string): string {
  const atSentenceStart = !/\p{L}/u.test(sentenceBefore);
  const capitalizedOnlyFirst = /^\p{Lu}[^\p{Lu}]*$/u.test(term);
  if (atSentenceStart && capitalizedOnlyFirst && baseLanguage(lang) !== 'de') {
    return term.charAt(0).toLocaleLowerCase(lang) + term.slice(1);
  }
  return term;
}

type NewWordInput = {
  id: string;
  term: string;
  lang: string;
  sentence: string;
  book: Pick<Book, 'id' | 'title'>;
  page: number;
  translation: TranslationResult | null;
  now: number;
};

export function createWord(input: NewWordInput): Word {
  return {
    id: input.id,
    term: input.term.slice(0, 120),
    lang: baseLanguage(input.lang),
    translation: input.translation?.translation ?? '',
    pos: input.translation?.partOfSpeech ?? '',
    definition: input.translation?.definition ?? '',
    ipa: input.translation?.ipa ?? '',
    note: '',
    tags: [],
    status: 'new',
    context: {
      sentence: input.sentence.slice(0, 1000),
      bookId: input.book.id,
      bookTitle: input.book.title.slice(0, 300),
      page: input.page,
    },
    srs: newSrs(input.now),
    createdAt: null,
    updatedAt: null,
  };
}
