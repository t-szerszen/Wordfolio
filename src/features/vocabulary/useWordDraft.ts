import { useCallback, useEffect, useRef, useState } from 'react';
import { useWords } from '../../hooks/useWords';
import type { Word } from '../../lib/data/models';

const SAVE_DELAY = 600;

type EditablePatch = Partial<
  Pick<Word, 'translation' | 'definition' | 'note' | 'tags' | 'status' | 'srs'>
>;

/**
 * Edycja karty trzyma tylko zmienione pola i przy zapisie nakłada je na najnowszą wersję słówka
 * z synchronizacji — powtórka zrobiona w tym czasie na innym urządzeniu nie zostanie cofnięta.
 */
export function useWordDraft(word: Word) {
  const { words, saveWord } = useWords();
  const [patch, setPatch] = useState<EditablePatch>({});
  const dirty = useRef(false);
  const latest = useRef({ word, patch, words, saveWord });
  useEffect(() => {
    latest.current = { word, patch, words, saveWord };
  });

  const flush = useCallback(() => {
    const current = latest.current;
    // Słówko usunięte w międzyczasie (np. na innym urządzeniu) nie może wrócić przez zaległy zapis.
    if (!dirty.current || !current.words.some((w) => w.id === current.word.id)) return;
    dirty.current = false;
    current.saveWord({ ...current.word, ...current.patch });
  }, []);

  useEffect(() => {
    if (!dirty.current) return;
    const timer = window.setTimeout(flush, SAVE_DELAY);
    return () => {
      window.clearTimeout(timer);
    };
  }, [patch, flush]);

  useEffect(() => {
    // Zamknięcie karty, przełączenie aplikacji albo zamknięcie PWA nie mogą zgubić ostatniej zmiany.
    const onHide = () => {
      if (document.visibilityState === 'hidden') flush();
    };
    window.addEventListener('pagehide', flush);
    document.addEventListener('visibilitychange', onHide);
    return () => {
      window.removeEventListener('pagehide', flush);
      document.removeEventListener('visibilitychange', onHide);
      flush();
    };
  }, [flush]);

  const update = (next: EditablePatch) => {
    dirty.current = true;
    setPatch((current) => ({ ...current, ...next }));
  };

  /** Przy usuwaniu karty nie wolno dosłać zaległej edycji. */
  const discard = () => {
    dirty.current = false;
  };

  return { draft: { ...word, ...patch }, update, flush, discard };
}
