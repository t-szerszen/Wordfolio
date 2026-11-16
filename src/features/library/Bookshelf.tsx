import { useRef } from 'react';
import { Icon } from '../../components/Icon';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { useElementWidth } from '../../hooks/useElementWidth';
import type { Book } from '../../lib/data/models';
import { countLabel } from '../../lib/plural';
import { BookCover } from './BookCover';
import { BookLink } from './BookLink';
import { spineSize } from './cover';
import { packRows } from './shelfRows';
import styles from './Bookshelf.module.css';

const SCALE = { phone: 1, tablet: 1.32, desktop: 1.12 } as const;
const ROW_PADDING = 16;

type ShelfEntry =
  | {
      kind: 'book';
      book: Book;
      variant: 'spine' | 'cover';
      width: number;
      height: number;
      gap: number;
    }
  | { kind: 'slot'; width: number; height: number; gap: number };

type BookshelfProps = {
  books: Book[];
  totalCount: number;
  isAvailable: (bookId: string) => boolean;
  onAdd: () => void;
  onMissing: (bookId: string) => void;
};

function isReading(book: Book): boolean {
  return book.lastOpenedAt !== null && book.page < book.pageCount;
}

export function Bookshelf({ books, totalCount, isAvailable, onAdd, onMissing }: BookshelfProps) {
  const ref = useRef<HTMLDivElement>(null);
  const width = useElementWidth(ref);
  const k = SCALE[useBreakpoint()];

  const newest =
    books.length >= 3
      ? books.reduce((a, b) => ((b.createdAt ?? 0) > (a.createdAt ?? 0) ? b : a))
      : null;
  const entries: ShelfEntry[] = books
    .filter((book) => book !== newest)
    .map((book) => {
      const size = spineSize(book.id, book.pageCount);
      return {
        kind: 'book' as const,
        book,
        variant: 'spine' as const,
        width: Math.round(size.width * k),
        height: Math.round(size.height * k),
        gap: 3,
      };
    });
  if (newest) {
    entries.push({
      kind: 'book',
      book: newest,
      variant: 'cover',
      width: Math.round(86 * k),
      height: Math.round(126 * k),
      gap: 14,
    });
  }
  entries.push({ kind: 'slot', width: Math.round(84 * k), height: Math.round(128 * k), gap: 14 });

  const rows = width > 0 ? packRows(entries, width - ROW_PADDING) : [entries];

  return (
    <section aria-labelledby="shelf-heading" className={styles.section}>
      <div className={styles.head}>
        <div className={styles.titles}>
          <h2 id="shelf-heading" className={styles.title}>
            Twoja półka
          </h2>
          <span className={styles.count}>
            {countLabel(totalCount, 'książka', 'książki', 'książek')}
          </span>
        </div>
        <button type="button" className={styles.add} onClick={onAdd}>
          <Icon name="upload" size={22} accent />
          Dodaj książkę
        </button>
      </div>
      <div ref={ref} className={styles.shelf}>
        {rows.map((row, rowIndex) => {
          const lastRow = rowIndex === rows.length - 1;
          return (
            <div key={rowIndex} className={styles.row}>
              <ul className={styles.books} style={{ minHeight: Math.round(172 * k) }}>
                {row.map((entry, index) => {
                  if (entry.kind === 'slot') {
                    return (
                      <li key="slot" style={{ marginLeft: index === 0 ? 0 : entry.gap }}>
                        <button
                          type="button"
                          className={styles.slot}
                          style={{ width: entry.width, height: entry.height }}
                          onClick={onAdd}
                        >
                          <Icon name="plus" size={22} />
                          <span className={styles.slotLabel}>miejsce na kolejną</span>
                        </button>
                      </li>
                    );
                  }
                  const { book } = entry;
                  const available = isAvailable(book.id);
                  const leaning =
                    entry.variant === 'cover' ||
                    (lastRow &&
                      index === row.length - 2 &&
                      row[row.length - 1]?.kind === 'slot' &&
                      row.length > 3);
                  return (
                    <li
                      key={book.id}
                      className={styles.item}
                      style={{ marginLeft: index === 0 ? 0 : entry.gap }}
                      data-leaning={leaning ? entry.variant : undefined}
                      data-missing={available ? undefined : true}
                    >
                      <BookLink
                        bookId={book.id}
                        available={available}
                        className={styles.bookLink}
                        onMissing={onMissing}
                      >
                        <BookCover
                          book={book}
                          variant={entry.variant}
                          width={entry.width}
                          height={entry.height}
                        />
                        {isReading(book) && <span aria-hidden="true" className={styles.reading} />}
                      </BookLink>
                    </li>
                  );
                })}
              </ul>
              <div aria-hidden="true" className={styles.plank} />
            </div>
          );
        })}
      </div>
    </section>
  );
}
