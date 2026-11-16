import styles from './SessionProgress.module.css';

const PATH = 'M2 5.4 C 50 3.6, 100 6.6, 150 4.8 S 250 3.8, 298 5.6';

export function SessionProgress({ done, total }: { done: number; total: number }) {
  const ratio = total > 0 ? done / total : 0;
  return (
    <div
      role="progressbar"
      aria-label="Postęp sesji"
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={done}
      className={styles.progress}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 300 10"
        preserveAspectRatio="none"
        className={styles.line}
      >
        <path className={styles.track} d={PATH} vectorEffect="non-scaling-stroke" />
        <path
          className={styles.fill}
          d={PATH}
          style={{ clipPath: `inset(-5px ${100 - Math.round(ratio * 100)}% -5px 0)` }}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}
