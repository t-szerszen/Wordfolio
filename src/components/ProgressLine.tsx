import styles from './ProgressLine.module.css';

type ProgressLineProps = {
  /** 0–1 */
  value: number;
  label: string;
  size?: 'card' | 'footer';
};

/** Odręczna linia postępu z zakładką w miejscu, w którym przerwano czytanie. */
export function ProgressLine({ value, label, size = 'card' }: ProgressLineProps) {
  const progress = Math.min(1, Math.max(0, value));
  const end = 2 + progress * 296;
  return (
    <div
      className={styles.progress}
      data-size={size}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress * 100)}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 300 8"
        preserveAspectRatio="none"
        className={styles.line}
      >
        <path
          className={styles.track}
          d="M2 4.2 C 60 3.2, 120 5, 180 3.8 S 260 3.4, 298 4.4"
          vectorEffect="non-scaling-stroke"
        />
        <path
          className={styles.fill}
          d={`M2 4.2 L ${end.toFixed(1)} 4.1`}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <span
        aria-hidden="true"
        className={styles.ribbon}
        style={{ left: `calc(${progress * 100}% - 5px)` }}
      />
    </div>
  );
}
