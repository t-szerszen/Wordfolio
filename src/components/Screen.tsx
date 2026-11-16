import type { ReactNode } from 'react';
import styles from './Screen.module.css';

type ScreenProps = {
  width?: 'wide' | 'medium' | 'narrow';
  /** Na telefonie dolny pasek zastępuje własna stopka ekranu (np. „Gotowe” na karcie słówka). */
  footer?: ReactNode;
  children: ReactNode;
};

export function Screen({ width = 'wide', footer, children }: ScreenProps) {
  return (
    <main id="main" className={styles.screen} data-width={width}>
      <div className={styles.inner}>{children}</div>
      {footer}
    </main>
  );
}
