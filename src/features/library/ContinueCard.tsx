import { ProgressLine } from '../../components/ProgressLine';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import type { Book } from '../../lib/data/models';
import { languageName } from '../../lib/language/names';
import { BookCover } from './BookCover';
import { BookLink } from './BookLink';
import styles from './ContinueCard.module.css';

const COVER = { phone: [78, 116], tablet: [96, 142], desktop: [92, 136] } as const;

type ContinueCardProps = {
  book: Book;
  available: boolean;
  onMissing: (bookId: string) => void;
};

export function ContinueCard({ book, available, onMissing }: ContinueCardProps) {
  const [width, height] = COVER[useBreakpoint()];
  const started = book.lastOpenedAt !== null;
  const meta = [book.author, languageName(book.lang)].filter(Boolean).join(' · ');
  return (
    <BookLink bookId={book.id} available={available} className={styles.card} onMissing={onMissing}>
      <span aria-hidden="true" className={styles.ribbon} />
      <BookCover book={book} variant="cover" width={width} height={height} />
      <span className={styles.body}>
        <span className={styles.kicker}>{started ? 'czytasz teraz' : 'nowa na półce'}</span>
        <span className={styles.title}>{book.title}</span>
        {meta && <span className={styles.meta}>{meta}</span>}
        <span className={styles.footer}>
          <ProgressLine value={book.page / book.pageCount} label="Postęp czytania" />
          <span className={styles.row}>
            <span>
              s. {book.page} z {book.pageCount}
            </span>
            <span className={styles.action}>
              {!available ? 'Wgraj plik' : started ? 'Czytaj dalej' : 'Zacznij'}
            </span>
          </span>
        </span>
      </span>
    </BookLink>
  );
}
