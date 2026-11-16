import type { CSSProperties } from 'react';
import type { Book } from '../../lib/data/models';
import { MOTIF_PATHS } from './motifs';
import styles from './BookCover.module.css';

type BookCoverProps = {
  book: Pick<Book, 'title' | 'author' | 'lang' | 'color' | 'motif'>;
  variant: 'cover' | 'spine' | 'mini';
  width: number;
  height: number;
};

function Motif({ d, size, strokeWidth }: { d: string; size: number; strokeWidth: number }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={styles.motif}
    >
      <path d={d} />
    </svg>
  );
}

/** Okładka generowana z koloru i motywu — PDF-y nie mają okładek, które dałoby się pokazać. */
export function BookCover({ book, variant, width, height }: BookCoverProps) {
  const d = MOTIF_PATHS[book.motif];
  const lang = book.lang.toUpperCase();
  const style: CSSProperties = { width, height };

  if (variant === 'spine') {
    return (
      <span className={`${styles.book} ${styles.spine}`} data-color={book.color} style={style}>
        <span className={styles.spineBody}>
          <Motif d={d} size={Math.round(width * 0.55)} strokeWidth={1.6} />
          <span
            className={styles.spineTitle}
            style={{ fontSize: Math.min(13, Math.max(9, Math.round(width * 0.4))) }}
          >
            {book.title}
          </span>
          <span className={styles.spineLang}>{lang}</span>
        </span>
        <span aria-hidden="true" className={styles.bandTop} />
        <span aria-hidden="true" className={styles.bandBottom} />
      </span>
    );
  }

  if (variant === 'mini') {
    return (
      <span className={`${styles.book} ${styles.cover}`} data-color={book.color} style={style}>
        <span className={styles.miniBody}>
          <Motif d={d} size={Math.round(width * 0.6)} strokeWidth={1.6} />
        </span>
      </span>
    );
  }

  const inset = Math.max(5, Math.round(width * 0.06));
  return (
    <span className={`${styles.book} ${styles.cover}`} data-color={book.color} style={style}>
      <span
        className={styles.coverFrame}
        style={{
          inset,
          padding: `${Math.round(height * 0.07)}px ${Math.round(width * 0.06)}px`,
        }}
      >
        <span className={styles.coverText} style={{ gap: Math.round(height * 0.03) }}>
          <span
            lang={book.lang}
            className={styles.coverTitle}
            style={{ fontSize: Math.max(9, Math.round(width * 0.108)) }}
          >
            {book.title}
          </span>
          {book.author && (
            <span
              className={styles.coverAuthor}
              style={{ fontSize: Math.max(7, Math.round(width * 0.06)) }}
            >
              {book.author}
            </span>
          )}
        </span>
        <Motif d={d} size={Math.round(width * 0.3)} strokeWidth={1.3} />
        <span
          className={styles.coverLang}
          style={{ fontSize: Math.max(11, Math.round(width * 0.11)) }}
        >
          {lang}
        </span>
      </span>
    </span>
  );
}
