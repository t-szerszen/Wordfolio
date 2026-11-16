import { Icon } from '../../components/Icon';
import styles from './PageNav.module.css';

type PageNavProps = {
  page: number;
  pageCount: number;
  onChange: (page: number) => void;
};

export function PageNav({ page, pageCount, onChange }: PageNavProps) {
  return (
    <nav className={styles.nav} aria-label="Strony książki">
      <button
        type="button"
        className={styles.button}
        aria-label="Poprzednia strona"
        disabled={page <= 1}
        onClick={() => {
          onChange(page - 1);
        }}
      >
        <Icon name="prev" size={22} />
      </button>
      <span className={styles.number}>— {page} —</span>
      <button
        type="button"
        className={styles.button}
        aria-label="Następna strona"
        disabled={page >= pageCount}
        onClick={() => {
          onChange(page + 1);
        }}
      >
        <Icon name="next" size={22} />
      </button>
    </nav>
  );
}
