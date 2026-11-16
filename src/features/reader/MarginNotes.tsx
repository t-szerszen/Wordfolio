import type { Word } from '../../lib/data/models';
import { normalizeTerm, type Token } from '../../lib/text/tokenize';
import styles from './MarginNotes.module.css';

const TILT = [-1.2, 0.8, -0.5, 1, -0.8];

type MarginNotesProps = {
  tokens: readonly Token[];
  lang: string;
  words: ReadonlyMap<string, Word>;
  exclude: string | null;
};

/** Odręczne dopiski na marginesie: zapisane słowa z tego akapitu i ich krótkie tłumaczenia. */
export function MarginNotes({ tokens, lang, words, exclude }: MarginNotesProps) {
  const seen = new Set<string>();
  const notes: Word[] = [];
  for (const token of tokens) {
    if (!token.word) continue;
    const key = normalizeTerm(token.text, lang);
    const word = words.get(key);
    if (word && !seen.has(key) && key !== exclude) {
      seen.add(key);
      notes.push(word);
    }
  }
  if (notes.length === 0) return null;
  return (
    <ul className={styles.notes}>
      {notes.map((word, i) => (
        <li
          key={word.id}
          className={styles.note}
          style={{ transform: `rotate(${TILT[i % TILT.length]}deg)` }}
        >
          <span lang={lang} className={styles.term} data-status={word.status}>
            {word.term}
          </span>
          {word.translation && <> — {word.translation.split(/[;,]/)[0]}</>}
        </li>
      ))}
    </ul>
  );
}
