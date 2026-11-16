import { Logo } from '../../components/Logo';
import { Screen } from '../../components/Screen';
import { greetingFor } from './greeting';
import styles from './ShelfScreen.module.css';

export function ShelfScreen() {
  return (
    <Screen>
      <header className={styles.header}>
        <span className={styles.logo}>
          <Logo size={30} label="Wordfolio" />
        </span>
      </header>
      <h1 className={styles.title}>{greetingFor(new Date())}</h1>
    </Screen>
  );
}
