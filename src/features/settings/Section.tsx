import { useId, type ReactNode } from 'react';
import styles from './Section.module.css';

const SHAPES = [
  '18px 22px 16px 20px / 20px 16px 22px 18px',
  '22px 18px 20px 16px / 16px 20px 18px 22px',
  '16px 20px 22px 18px / 22px 18px 16px 20px',
  '20px 16px 18px 22px / 18px 22px 20px 16px',
  '18px 22px 20px 16px / 20px 16px 22px 18px',
  '22px 16px 18px 20px / 16px 20px 22px 18px',
];

export function Section({
  title,
  shape,
  children,
}: {
  title: string;
  shape: number;
  children: ReactNode;
}) {
  const id = useId();
  return (
    <section
      aria-labelledby={id}
      className={styles.section}
      style={{ borderRadius: SHAPES[shape % SHAPES.length] }}
    >
      <h2 id={id} className={styles.title}>
        {title}
      </h2>
      {children}
    </section>
  );
}
