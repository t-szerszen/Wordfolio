import { initializeApp, type FirebaseApp, type FirebaseOptions } from 'firebase/app';
import {
  browserLocalPersistence,
  browserPopupRedirectResolver,
  indexedDBLocalPersistence,
  initializeAuth,
  type Auth,
} from 'firebase/auth';

export type FirebaseServices = {
  app: FirebaseApp;
  auth: Auth;
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
  services = { app, auth };
  return services;
}
