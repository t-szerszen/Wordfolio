import { Outlet } from 'react-router';
import { TabBar } from '../components/TabBar';
import { useDueWords } from '../hooks/useDueWords';
import styles from './AppShell.module.css';

export function AppShell() {
  const dueCount = useDueWords().length;
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
