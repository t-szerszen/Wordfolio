import { memo, type ReactNode } from 'react';
import type { WordStatus } from '../../lib/data/models';
import { normalizeTerm, type Token } from '../../lib/text/tokenize';
import styles from './ReaderParagraph.module.css';

const STATUS_LABEL: Record<WordStatus, string> = {
  new: 'nowe',
  learning: 'w nauce',
  known: 'znane',
};

type ReaderParagraphProps = {
  index: number;
  tokens: readonly Token[];
  heading: boolean;
  dropCap: boolean;
  lang: string;
  statuses: ReadonlyMap<string, WordStatus> | null;
  /** Zaznaczony zakres tokenów w tym akapicie. */
  selected: { start: number; end: number } | null;
  /** Token, który ma tabindex=0 (wędrujący fokus). */
  focusToken: number | null;
};

export const ReaderParagraph = memo(function ReaderParagraph({
  index,
  tokens,
  heading,
  dropCap,
  lang,
  statuses,
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
    const status = statuses?.get(normalizeTerm(token.text, lang));
    return (
      <span
        key={i}
        role="button"
        tabIndex={focusToken === i ? 0 : -1}
        aria-haspopup="dialog"
        aria-pressed={inRange}
        aria-label={status ? `${token.text} — ${STATUS_LABEL[status]}` : undefined}
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
      data-paragraph={index}
      data-drop-cap={dropCap || undefined}
    >
      {children}
    </p>
  );
});
