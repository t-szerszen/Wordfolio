import { memo, type ReactNode } from 'react';
import type { Word } from '../../lib/data/models';
import { STATUS_LABELS } from '../../lib/data/statusLabels';
import { normalizeTerm, type Token } from '../../lib/text/tokenize';
import styles from './ReaderParagraph.module.css';

type ReaderParagraphProps = {
  paragraph: number;
  tokens: readonly Token[];
  heading: boolean;
  dropCap: boolean;
  lang: string;
  words: ReadonlyMap<string, Word>;
  /** Zaznaczony zakres tokenów w tym akapicie. */
  selected: { start: number; end: number } | null;
  /** Token, który ma tabindex=0 (wędrujący fokus). */
  focusToken: number | null;
};

export const ReaderParagraph = memo(function ReaderParagraph({
  paragraph,
  tokens,
  heading,
  dropCap,
  lang,
  words,
  selected,
  focusToken,
}: ReaderParagraphProps) {
  const children: ReactNode[] = tokens.map((token, i) => {
    const inRange = selected !== null && i >= selected.start && i <= selected.end;
    if (!token.word) {
      return inRange && i > selected.start && i < selected.end ? (
        <span key={i} className={styles.selectedGap}>
          {token.text}
        </span>
      ) : (
        token.text
      );
    }
    const status = words.get(normalizeTerm(token.text, lang))?.status;
    return (
      <span
        key={i}
        role="button"
        tabIndex={focusToken === i ? 0 : -1}
        aria-haspopup="dialog"
        aria-pressed={inRange}
        aria-label={status ? `${token.text} — ${STATUS_LABELS[status]}` : undefined}
        className={styles.word}
        data-token={i}
        data-status={status}
        data-selected={inRange || undefined}
      >
        {token.text}
        {selected?.start === i && (
          <span aria-hidden="true" className={styles.handleStart} data-handle="start" />
        )}
        {selected?.end === i && (
          <span aria-hidden="true" className={styles.handleEnd} data-handle="end" />
        )}
      </span>
    );
  });

  return (
    <p
      className={heading ? styles.heading : styles.paragraph}
      data-paragraph={paragraph}
      data-drop-cap={dropCap || undefined}
    >
      {children}
    </p>
  );
});
