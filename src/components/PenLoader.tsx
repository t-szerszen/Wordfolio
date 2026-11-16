import styles from './PenLoader.module.css';

/** Odręczna falka rysowana w kółko — „szukam w słowniku…”. */
export function PenLoader({ label }: { label: string }) {
  return (
    <div className={styles.loader} role="status">
      <svg aria-hidden="true" viewBox="0 0 180 20" width={180} height={20} className={styles.pen}>
        <path
          pathLength={220}
          d="M2 12 C 8 4, 12 18, 18 10 C 24 2, 28 17, 34 10 C 40 4, 44 16, 50 11 C 58 5, 62 16, 70 10 C 78 4, 82 15, 90 11 C 98 6, 104 15, 112 10 C 120 5, 126 15, 134 11 C 142 7, 148 14, 156 11 C 164 8, 170 12, 178 10"
        />
      </svg>
      <span className={styles.label}>{label}</span>
    </div>
  );
}
