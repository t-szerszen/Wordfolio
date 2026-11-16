import { initializeApp, type FirebaseApp, type FirebaseOptions } from 'firebase/app';
import {
  browserPopupRedirectResolver,
  indexedDBLocalPersistence,
  browserLocalPersistence,
  initializeAuth,
  type Auth,
} from 'firebase/auth';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  type Firestore,
} from 'firebase/firestore';

export type FirebaseServices = {
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
};

let services: FirebaseServices | null = null;

export function initFirebase(options: FirebaseOptions): FirebaseServices {
  if (services) return services;
  const app = initializeApp(options);
  const auth = initializeAuth(app, {
    persistence: [indexedDBLocalPersistence, browserLocalPersistence],
    popupRedirectResolver: browserPopupRedirectResolver,
  });
  auth.languageCode = 'pl';
  // Trwały cache z obsługą wielu kart: czytanie, powtórki i zapis słówek działają offline,
  // a zmiany dosyłają się po powrocie sieci.
  const db = initializeFirestore(app, {
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
  });
  services = { app, auth, db };
  return services;
}
