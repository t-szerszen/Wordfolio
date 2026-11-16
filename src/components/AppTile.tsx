import { Logo } from './Logo';
import styles from './AppTile.module.css';

/** Logo w kafelku ikony aplikacji (wariant „app” z designu). */
export function AppTile({ size }: { size: number }) {
  return (
    <span
      className={styles.tile}
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.225),
        paddingTop: Math.round(size * 0.03),
      }}
    >
      <Logo variant="mark" size={Math.round(size * 0.68)} knock="var(--tile-flat)" />
    </span>
  );
}
