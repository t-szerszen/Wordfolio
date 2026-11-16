import type { ReactNode } from 'react';
import styles from './WordSheet.module.css';

/** Arkusz od dołu ekranu na telefonie. */
export function WordSheet({ children }: { children: ReactNode }) {
  return (
    <div role="dialog" aria-label="Notatka do słowa" className={styles.sheet}>
      <svg aria-hidden="true" viewBox="0 0 44 6" width={44} height={6} className={styles.grip}>
        <path d="M2 3.4 C 10 2, 20 4.6, 30 3 C 36 2.2, 40 3.6, 42 3.2" />
      </svg>
      {children}
    </div>
  );
}

/** Karteczka przyklejona na marginesie obok akapitu (tablet, desktop). */
export function WordNote({ children }: { children: ReactNode }) {
  return (
    <div role="dialog" aria-label="Notatka do słowa" className={styles.note}>
      <span aria-hidden="true" className={styles.tape} />
      {children}
    </div>
  );
}
