import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { useSettings } from '../../hooks/useSettings';
import { useTranslation, type TranslationState } from '../../hooks/useTranslation';
import { useWords } from '../../hooks/useWords';
import type { Book, Word } from '../../lib/data/models';
import { baseLanguage } from '../../lib/language/names';
import type { Paragraph } from '../../lib/pdf/layout';
import { sentenceAround, sentenceText, type SentenceContext } from '../../lib/text/sentence';
import { normalizeTerm, type Token } from '../../lib/text/tokenize';
import type { TranslationRequest } from '../../lib/translation';
import { createWord, dictionaryForm, wordIdFor } from '../vocabulary/wordFactory';
import { isPhrase, selectionRange, type Selection } from './selection';

export type SelectedWord = {
  term: string;
  phrase: boolean;
  context: SentenceContext;
  existing: Word | null;
  translation: TranslationState;
  retry: () => void;
  save: () => void;
  /** Usunąć można tylko słówko bez postępów w powtórkach. */
  canUnsave: boolean;
  unsave: () => void;
  openCard: () => void;
};

export function useSelectedWord(
  book: Book,
  page: number,
  paragraphs: readonly Paragraph[] | null,
  tokens: readonly (readonly Token[])[],
  selection: Selection | null,
): SelectedWord | null {
  const { settings } = useSettings();
  const { words, saveWord, removeWord } = useWords();
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState(0);

  const paragraphText = selection ? paragraphs?.[selection.paragraph]?.text : undefined;
  const paragraphTokens = selection ? tokens[selection.paragraph] : undefined;
  const start = selection?.start;
  const end = selection?.end;

  const info = useMemo(() => {
    if (
      paragraphText === undefined ||
      !paragraphTokens ||
      start === undefined ||
      end === undefined
    ) {
      return null;
    }
    const { from, to } = selectionRange(paragraphTokens, { paragraph: 0, start, end });
    const context = sentenceAround(paragraphText, from, to, book.lang);
    const surface = paragraphText.slice(from, to).replace(/\s+/g, ' ');
    return { surface, term: dictionaryForm(surface, context.before, book.lang), context };
  }, [paragraphText, paragraphTokens, start, end, book.lang]);

  const base = baseLanguage(book.lang);
  const existing = useMemo(() => {
    if (!info) return null;
    const key = normalizeTerm(info.term, book.lang);
    return (
      words.find(
        (w) => baseLanguage(w.lang) === base && normalizeTerm(w.term, book.lang) === key,
      ) ?? null
    );
  }, [info, words, base, book.lang]);

  const surface = info?.surface;
  const sentence = info ? sentenceText(info.context) : undefined;
  const request = useMemo<TranslationRequest | null>(
    () =>
      surface && sentence !== undefined && !existing
        ? { word: surface, sentence, sourceLang: base, targetLang: settings.targetLang }
        : null,
    [surface, sentence, existing, base, settings.targetLang],
  );
  const translation = useTranslation(request, attempt);

  const persist = useCallback(async (): Promise<string | null> => {
    if (!info) return null;
    if (existing) return existing.id;
    const id = await wordIdFor(info.term, book.lang);
    saveWord(
      createWord({
        id,
        term: info.term,
        lang: book.lang,
        sentence: sentenceText(info.context).trim(),
        book,
        page,
        translation: translation.status === 'ready' ? translation.result : null,
        now: Date.now(),
      }),
    );
    return id;
  }, [info, existing, book, page, translation, saveWord]);

  if (!info || !selection) return null;

  return {
    term: info.term,
    phrase: isPhrase(selection),
    context: info.context,
    existing,
    translation: existing
      ? {
          status: 'ready',
          result: {
            translation: existing.translation,
            partOfSpeech: existing.pos,
            definition: existing.definition,
            ipa: existing.ipa,
          },
        }
      : translation,
    retry: () => {
      setAttempt((a) => a + 1);
    },
    save: () => {
      void persist();
    },
    canUnsave: existing !== null && existing.srs.reps === 0,
    unsave: () => {
      if (existing?.srs.reps === 0) removeWord(existing.id);
    },
    openCard: () => {
      void persist().then((id) => {
        if (id) void navigate(`/slownik/${id}`);
      });
    },
  };
}
