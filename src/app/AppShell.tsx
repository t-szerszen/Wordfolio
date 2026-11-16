import { useEffect } from 'react';
import { Outlet, useLocation, useMatch } from 'react-router';
import { TabBar } from '../components/TabBar';
import { useDueWords } from '../hooks/useDueWords';
import styles from './AppShell.module.css';

export function AppShell() {
  const dueCount = useDueWords().length;
  // Na telefonie karta słówka ma własny przycisk „Gotowe” w miejscu dolnego paska.
  const onWordCard = useMatch('/slownik/:wordId') !== null;
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return (
    <div className={styles.shell}>
      <a href="#main" className={styles.skip}>
        Przejdź do treści
      </a>
      <TabBar dueCount={dueCount} hideOnPhone={onWordCard} />
      <Outlet />
    </div>
  );
}
