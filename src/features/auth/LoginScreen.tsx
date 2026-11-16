import { AppTile } from '../../components/AppTile';
import { Button } from '../../components/Button';
import { useAuth } from './useAuth';
import styles from './LoginScreen.module.css';

export function LoginScreen() {
  const { state, signIn } = useAuth();
  const busy = state.status === 'signed-out' && state.busy;
  const error = state.status === 'signed-out' ? state.error : null;

  return (
    <main className={styles.screen}>
      <div className={styles.content}>
        <AppTile size={96} />
        <div className={styles.text}>
          <h1 className={styles.title}>Wordfolio</h1>
          <p className={styles.lead}>
            Czytaj książki w oryginale, stukaj nieznane słowa i ucz się ich razem ze zdaniem z
            książki.
          </p>
        </div>
        <Button
          icon="user"
          onClick={() => void signIn()}
          disabled={busy}
          aria-busy={busy}
          className={styles.button}
        >
          {busy ? 'Logowanie…' : 'Zaloguj przez Google'}
        </Button>
        <p className={styles.error} role="alert">
          {error}
        </p>
        <p className={styles.note}>pliki PDF zostają na Twoim urządzeniu</p>
      </div>
    </main>
  );
}
