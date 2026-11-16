import { AppTile } from '../components/AppTile';
import styles from './ConfigMissingScreen.module.css';

export function ConfigMissingScreen({ missing }: { missing: readonly string[] }) {
  return (
    <main className={styles.screen}>
      <div className={styles.content}>
        <AppTile size={72} />
        <h1 className={styles.title}>Brakuje konfiguracji Firebase</h1>
        <p className={styles.text}>
          Wordfolio nie może się połączyć z Firebase, bo w pliku <code>.env</code> (albo w zmiennych
          repozytorium przy wdrożeniu) brakuje tych wartości:
        </p>
        <ul className={styles.list}>
          {missing.map((name) => (
            <li key={name}>
              <code>{name}</code>
            </li>
          ))}
        </ul>
        <p className={styles.text}>
          Skopiuj <code>.env.example</code> do <code>.env</code>, uzupełnij dane z konsoli Firebase
          i uruchom aplikację ponownie.
        </p>
      </div>
    </main>
  );
}
