import {
  disableNetwork,
  enableNetwork,
  waitForPendingWrites,
  type Firestore,
} from 'firebase/firestore';

/** Wymusza ponowne połączenie i czeka, aż lokalne zmiany trafią na serwer. */
export async function syncNow(db: Firestore): Promise<void> {
  await disableNetwork(db);
  await enableNetwork(db);
  await waitForPendingWrites(db);
}
