import styles from './SaveButton.module.css';

const STAR =
  'M12 3.7 L 14.35 8.85 L 20 9.45 L 15.75 13.25 L 17 18.95 L 12.05 16 L 6.95 18.85 L 8.25 13.3 L 4 9.5 L 9.7 8.9 Z';

type SaveButtonProps = {
  saved: boolean;
  disabled: boolean;
  compact: boolean;
  onClick: () => void;
};

/** Gwiazdka „wypełnia się” od dołu po zapisaniu słowa. */
export function SaveButton({ saved, disabled, compact, onClick }: SaveButtonProps) {
  return (
    <button
      type="button"
      className={styles.button}
      data-saved={saved || undefined}
      data-compact={compact || undefined}
      aria-pressed={saved}
      disabled={disabled}
      onClick={onClick}
    >
      <span className={styles.star}>
        <svg aria-hidden="true" viewBox="0 0 24 24" className={styles.outline}>
          <path d={STAR} />
        </svg>
        <svg aria-hidden="true" viewBox="0 0 24 24" className={styles.fill}>
          <path d={STAR} />
        </svg>
      </span>
      {saved ? 'W słowniku' : 'Zapisz'}
    </button>
  );
}
