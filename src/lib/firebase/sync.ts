import {
  disableNetwork,
  enableNetwork,
  waitForPendingWrites,
  type Firestore,
} from 'firebase/firestore';

const TIMEOUT_MS = 15_000;

/**
 * Wymusza ponowne połączenie i czeka, aż lokalne zmiany trafią na serwer. Bez sieci (np. za
 * portalem logowania Wi-Fi) potwierdzenie nie przyjdzie nigdy, więc czekamy najwyżej 15 s.
 */
export async function syncNow(db: Firestore): Promise<void> {
  await disableNetwork(db);
  await enableNetwork(db);
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(new Error('Serwer nie odpowiada'));
    }, TIMEOUT_MS);
  });
  try {
    await Promise.race([waitForPendingWrites(db), timeout]);
  } finally {
    clearTimeout(timer);
  }
}
