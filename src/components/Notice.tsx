import type { ReactNode } from 'react';
import { Icon } from './Icon';
import styles from './Notice.module.css';

type NoticeProps = {
  children: ReactNode;
  onDismiss?: () => void;
};

export function Notice({ children, onDismiss }: NoticeProps) {
  return (
    <div className={styles.notice} role="alert">
      <p className={styles.text}>{children}</p>
      {onDismiss && (
        <button
          type="button"
          className={styles.close}
          aria-label="Zamknij komunikat"
          onClick={onDismiss}
        >
          <Icon name="close" size={20} />
        </button>
      )}
    </div>
  );
}
