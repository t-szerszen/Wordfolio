import { intervalLabel } from '../../lib/dates';
import type { Grade } from '../../lib/srs/types';
import { GRADES } from './grades';
import styles from './GradeButtons.module.css';

type GradeButtonsProps = {
  intervals: Record<Grade, number>;
  onGrade: (grade: Grade) => void;
};

export function GradeButtons({ intervals, onGrade }: GradeButtonsProps) {
  return (
    <div role="group" aria-label="Jak dobrze pamiętasz?" className={styles.grid}>
      {GRADES.map(({ grade, label, color }, i) => (
        <button
          key={grade}
          type="button"
          className={styles.button}
          aria-keyshortcuts={String(i + 1)}
          onClick={() => {
            onGrade(grade);
          }}
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 40 6"
            width={30}
            height={6}
            className={styles.mark}
            style={{ stroke: color }}
          >
            <path d="M2 3.4 C 10 2, 20 4.6, 30 3 C 34 2.4, 37 3.4, 38 3.2" />
          </svg>
          <span className={styles.label}>{label}</span>
          <span className={styles.interval}>{intervalLabel(intervals[grade])}</span>
        </button>
      ))}
    </div>
  );
}
