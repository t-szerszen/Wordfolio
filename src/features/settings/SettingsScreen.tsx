import { Button } from '../../components/Button';
import { Icon } from '../../components/Icon';
import { Logo } from '../../components/Logo';
import { PageTitle } from '../../components/PageTitle';
import { Screen } from '../../components/Screen';
import { useWords } from '../../hooks/useWords';
import { downloadText, wordsToCsv } from '../../lib/export/csv';
import { dayKey } from '../../lib/streak';
import { useAuth, useCurrentUser } from '../auth/useAuth';
import { LanguageSettings } from './LanguageSettings';
import { ReadingSettings } from './ReadingSettings';
import { Section } from './Section';
import { SyncSection } from './SyncSection';
import { ThemePicker } from './ThemePicker';
import styles from './SettingsScreen.module.css';

export function SettingsScreen() {
  const { signOut } = useAuth();
  const user = useCurrentUser();
  const { words } = useWords();

  return (
    <Screen width="medium">
      <PageTitle>Ustawienia</PageTitle>
      <div className={styles.grid}>
        <Section title="Wygląd" shape={0}>
          <ThemePicker />
        </Section>
        <Section title="Czytanie" shape={1}>
          <ReadingSettings />
        </Section>
        <Section title="Języki" shape={2}>
          <LanguageSettings />
        </Section>
        <Section title="Synchronizacja" shape={3}>
          <SyncSection />
        </Section>
        <Section title="Konto" shape={4}>
          <div className={styles.account}>
            <span className={styles.avatar}>
              <Icon name="user" size={22} />
            </span>
            <span className={styles.accountText}>
              <span className={styles.accountTitle}>Zalogowano przez Google</span>
              <span className={styles.email}>{user.email || user.displayName}</span>
            </span>
          </div>
          <Button variant="link" className={styles.signOut} onClick={() => void signOut()}>
            Wyloguj
          </Button>
        </Section>
        <Section title="Eksport fiszek" shape={5}>
          <p className={styles.text}>Pobierz cały słownik ze zdaniami z książek i notatkami.</p>
          <Button
            variant="soft"
            size="medium"
            icon="export"
            iconAccent
            className={styles.export}
            disabled={words.length === 0}
            onClick={() => {
              downloadText(
                wordsToCsv(words),
                `wordfolio-slowka-${dayKey(new Date())}.csv`,
                'text/csv;charset=utf-8',
              );
            }}
          >
            CSV
          </Button>
        </Section>
      </div>
      <footer className={styles.footer}>
        <Logo variant="mark" size={26} label="Wordfolio" />
        <span>Wordfolio · wersja {__APP_VERSION__}</span>
      </footer>
    </Screen>
  );
}
