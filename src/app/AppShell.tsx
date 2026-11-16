import { Outlet } from 'react-router';
import { TabBar } from '../components/TabBar';
import styles from './AppShell.module.css';

type AppShellProps = {
  dueCount: number;
};

export function AppShell({ dueCount }: AppShellProps) {
  return (
    <div className={styles.shell}>
      <a href="#main" className={styles.skip}>
        Przejdź do treści
      </a>
      <TabBar dueCount={dueCount} />
      <Outlet />
    </div>
  );
}
