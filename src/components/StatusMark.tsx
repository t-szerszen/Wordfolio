import type { WordStatus } from '../lib/data/models';
import { STATUS_LABELS } from '../lib/data/statusLabels';
import styles from './StatusMark.module.css';

const WAVE = 'M1 3 C 3 1, 5 5, 7 3 S 11 1, 13 3 S 16 4.6, 17 3';
const LINE = 'M1 3.2 C 6 2.8, 12 3.4, 17 2.9';

/** Mały znak statusu: falka (nowe, w nauce) albo prosta kreska (znane). */
export function StatusSwatch({ status }: { status: WordStatus }) {
  return (
    <svg
      aria-hidden="true"
      width={18}
      height={6}
      viewBox="0 0 18 6"
      className={styles.swatch}
      data-status={status}
    >
      <path d={status === 'known' ? LINE : WAVE} />
    </svg>
  );
}

export function StatusMark({ status }: { status: WordStatus }) {
  return (
    <span className={styles.mark}>
      <StatusSwatch status={status} />
      {STATUS_LABELS[status]}
    </span>
  );
}
