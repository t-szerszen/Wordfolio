import { Link } from 'react-router';
import { SentenceQuote } from '../../components/SentenceQuote';
import type { Word } from '../../lib/data/models';
import { STATUS_LABELS } from '../../lib/data/statusLabels';
import styles from './WordTile.module.css';

const SHAPES = ['index', 'stickyOchre', 'index', 'stickySage', 'strip', 'stickyRose'] as const;

function seed(id: string, from: number): number {
  return parseInt(id.slice(from, from + 2), 16) || 0;
}

/** „Alice’s Adventures in Wonderland” → „Alice’s Adventures…” — na kafelku liczy się zwięzłość. */
function shortTitle(title: string): string {
  return title.length > 22 ? `${title.slice(0, 20).trimEnd()}…` : title;
}

export function WordTile({ word }: { word: Word }) {
  const shape = SHAPES[seed(word.id, 0) % SHAPES.length] ?? 'index';
  const sticky = shape.startsWith('sticky');
  const tilt = shape === 'strip' ? 0 : ((seed(word.id, 2) % 7) - 3) * (sticky ? 0.45 : 0.15);
  const tape = sticky && seed(word.id, 4) % 2 === 0;
  const { context } = word;
  const source = [
    context.bookTitle && shortTitle(context.bookTitle),
    context.page && `s. ${context.page}`,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <Link
      to={`/slownik/${word.id}`}
      className={styles.tile}
      data-shape={shape}
      style={{ transform: tilt ? `rotate(${tilt}deg)` : undefined }}
      aria-label={`${word.term}${word.translation ? ` — ${word.translation}` : ''}, ${STATUS_LABELS[word.status]}`}
    >
      {tape && <span aria-hidden="true" className={styles.tape} />}
      <span lang={word.lang} className={styles.term} data-status={word.status}>
        {word.term}
      </span>
      {word.translation && <span className={styles.translation}>{word.translation}</span>}
      {shape === 'index' && context.sentence && (
        <SentenceQuote
          sentence={context.sentence}
          term={word.term}
          lang={word.lang}
          className={styles.snippet}
        />
      )}
      {word.note && <span className={styles.note}>{word.note}</span>}
      <span className={styles.footer}>
        <span className={styles.source}>{source}</span>
        <span className={styles.status}>{STATUS_LABELS[word.status]}</span>
      </span>
    </Link>
  );
}
