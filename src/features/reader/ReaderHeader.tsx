import { Link } from 'react-router';
import { Icon } from '../../components/Icon';
import styles from './ReaderHeader.module.css';

type ReaderHeaderProps = {
  title: string;
  lang: string;
  position: string;
  panelOpen: boolean;
  bookmarked: boolean;
  onTogglePanel: () => void;
  onToggleBookmark: () => void;
};

export function ReaderHeader({
  title,
  lang,
  position,
  panelOpen,
  bookmarked,
  onTogglePanel,
  onToggleBookmark,
}: ReaderHeaderProps) {
  return (
    <header className={styles.header}>
      <Link to="/" className={styles.iconButton} aria-label="Wróć na półkę">
        <Icon name="prev" />
      </Link>
      <div className={styles.titles}>
        <span lang={lang} className={styles.title}>
          {title}
        </span>
        <span className={styles.position}>{position}</span>
      </div>
      <button
        type="button"
        className={styles.iconButton}
        data-active={panelOpen || undefined}
        aria-label="Typografia i motyw"
        aria-expanded={panelOpen}
        aria-controls="typography-panel"
        onClick={onTogglePanel}
      >
        <Icon name="type" accent={panelOpen} />
      </button>
      <button
        type="button"
        className={`${styles.iconButton} ${styles.ribbon}`}
        aria-label="Zakładka na tej stronie"
        aria-pressed={bookmarked}
        onClick={onToggleBookmark}
      >
        <Icon name="ribbon" filled={bookmarked} />
      </button>
      <svg
        aria-hidden="true"
        viewBox="0 0 400 6"
        preserveAspectRatio="none"
        className={styles.rule}
      >
        <path
          d="M0 3.4 C 40 2.2, 90 4.2, 140 3.1 S 230 2.4, 280 3.6 S 360 2.7, 400 3.2"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </header>
  );
}
