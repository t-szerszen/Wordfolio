import { useEffect, useRef, useState } from 'react';
import { useWords } from '../../hooks/useWords';
import type { Word } from '../../lib/data/models';

const SAVE_DELAY = 600;

/**
 * Edycja karty na lokalnej kopii z opóźnionym zapisem całego dokumentu.
 * Zmiany z innych urządzeń w trakcie edycji nie nadpisują tego, co właśnie piszesz.
 */
export function useWordDraft(word: Word) {
  const { saveWord } = useWords();
  const [draft, setDraft] = useState(word);
  const pending = useRef<Word | null>(null);

  useEffect(() => {
    if (!pending.current) return;
    const timer = window.setTimeout(() => {
      if (pending.current) saveWord(pending.current);
      pending.current = null;
    }, SAVE_DELAY);
    return () => {
      window.clearTimeout(timer);
    };
  }, [draft, saveWord]);

  useEffect(
    () => () => {
      if (pending.current) saveWord(pending.current);
    },
    [saveWord],
  );

  const update = (patch: Partial<Word>) => {
    setDraft((current) => {
      const next = { ...current, ...patch };
      pending.current = next;
      return next;
    });
  };

  const flush = () => {
    if (pending.current) saveWord(pending.current);
    pending.current = null;
  };

  /** Przy usuwaniu karty nie wolno dosłać zaległej edycji — wskrzesiłaby słówko. */
  const discard = () => {
    pending.current = null;
  };

  return { draft, update, flush, discard };
}
