import { useState } from 'react';
import { Button } from '../../components/Button';
import { Icon } from '../../components/Icon';
import { useBooks } from '../../hooks/useBooks';
import { useNow } from '../../hooks/useNow';
import { useSyncStatus } from '../../hooks/useSyncStatus';
import { useWords } from '../../hooks/useWords';
import type { SyncState } from '../../lib/data/syncStatus';
import { countLabel } from '../../lib/plural';
import styles from './SyncSection.module.css';

const TITLES: Record<SyncState, string> = {
  synced: 'Zsynchronizowano',
  saving: 'Zapisuję zmiany…',
  offline: 'Offline',
  connecting: 'Łączę z serwerem…',
};

function ago(timestamp: number | null, now: number): string {
  if (timestamp === null) return 'jeszcze nie';
  const minutes = Math.floor((now - timestamp) / 60_000);
  if (minutes < 1) return 'przed chwilą';
  if (minutes < 60) return `${countLabel(minutes, 'minutę', 'minuty', 'minut')} temu`;
  return new Date(timestamp).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
}

export function SyncSection() {
  const { state, lastSyncedAt, error, syncNow } = useSyncStatus();
  const { words } = useWords();
  const { books } = useBooks();
  const now = useNow(30_000);
  const [busy, setBusy] = useState(false);
  const counts = `${countLabel(words.length, 'słówko', 'słówka', 'słówek')}, ${countLabel(books.length, 'książka', 'książki', 'książek')}`;
  const detail =
    state === 'offline'
      ? `zmiany zapiszą się po powrocie sieci · ${counts}`
      : `${state === 'synced' ? ago(lastSyncedAt, now) : 'chwileczkę'} · ${counts}`;

  return (
    <>
      <div className={styles.status} aria-live="polite">
        <span className={styles.badge} data-state={state}>
          <Icon name="sync" size={22} />
        </span>
        <span className={styles.text}>
          <span className={styles.title}>{TITLES[state]}</span>
          <span className={styles.detail}>{detail}</span>
        </span>
      </div>
      {error && <p className={styles.error}>{error}</p>}
      <Button
        variant="soft"
        size="medium"
        className={styles.button}
        disabled={state === 'offline' || busy}
        onClick={() => {
          setBusy(true);
          void syncNow().finally(() => {
            setBusy(false);
          });
        }}
      >
        {busy ? 'Synchronizuję…' : 'Synchronizuj teraz'}
      </Button>
    </>
  );
}
