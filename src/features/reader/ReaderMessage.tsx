import type { ReactNode } from 'react';
import { Link } from 'react-router';
import styles from './ReaderMessage.module.css';

type ReaderMessageProps = {
  title: string;
  children?: ReactNode;
  action?: ReactNode;
};

export function ReaderMessage({ title, children, action }: ReaderMessageProps) {
  return (
    <div className={styles.message}>
      <h1 className={styles.title}>{title}</h1>
      {children && <p className={styles.text}>{children}</p>}
      {action}
      <Link to="/" className={styles.back}>
        Wróć na półkę
      </Link>
    </div>
  );
}
