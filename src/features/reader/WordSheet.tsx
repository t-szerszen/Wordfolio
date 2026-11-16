import { useEffect, useRef, type ReactNode } from 'react';
import styles from './WordSheet.module.css';

/** Fokus trafia do notatki od razu po jej otwarciu, żeby klawiatura i czytnik ekranu ją widziały. */
function useFocusOnOpen() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.focus({ preventScroll: true });
  }, []);
  return ref;
}

/** Arkusz od dołu ekranu na telefonie. */
export function WordSheet({ children }: { children: ReactNode }) {
  const ref = useFocusOnOpen();
  return (
    <div
      ref={ref}
      role="dialog"
      aria-label="Notatka do słowa"
      tabIndex={-1}
      className={styles.sheet}
    >
      <svg aria-hidden="true" viewBox="0 0 44 6" width={44} height={6} className={styles.grip}>
        <path d="M2 3.4 C 10 2, 20 4.6, 30 3 C 36 2.2, 40 3.6, 42 3.2" />
      </svg>
      {children}
    </div>
  );
}

/** Karteczka przyklejona na marginesie obok akapitu (tablet, desktop). */
export function WordNote({ children }: { children: ReactNode }) {
  const ref = useFocusOnOpen();
  return (
    <div
      ref={ref}
      role="dialog"
      aria-label="Notatka do słowa"
      tabIndex={-1}
      className={styles.note}
    >
      <span aria-hidden="true" className={styles.tape} />
      {children}
    </div>
  );
}
