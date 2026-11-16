import { ProgressLine } from '../../components/ProgressLine';
import styles from './ReaderFooter.module.css';

type ReaderFooterProps = {
  chapter: string | null;
  page: number;
  pageCount: number;
};

/** Cicha stopka czytania: rozdział, postęp i numer strony. */
export function ReaderFooter({ chapter, page, pageCount }: ReaderFooterProps) {
  return (
    <div className={styles.footer}>
      {chapter && <span className={styles.chapter}>rozdz. {chapter}</span>}
      <div className={styles.progress}>
        <ProgressLine value={page / pageCount} label="Postęp w książce" size="footer" />
      </div>
      <span className={styles.page}>{page}</span>
    </div>
  );
}
