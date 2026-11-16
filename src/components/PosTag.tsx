import styles from './PosTag.module.css';

/** Odręczna etykieta w kształcie zawieszki — część mowy albo etykieta słówka. */
export function PosTag({
  children,
  size = 'medium',
}: {
  children: string;
  size?: 'medium' | 'large';
}) {
  return (
    <span className={styles.tag} data-size={size}>
      {children}
    </span>
  );
}
