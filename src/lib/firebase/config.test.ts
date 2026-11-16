import { describe, expect, it } from 'vitest';
import { readFirebaseConfig } from './config';

const FULL = {
  VITE_FIREBASE_API_KEY: 'key',
  VITE_FIREBASE_AUTH_DOMAIN: 'demo.firebaseapp.com',
  VITE_FIREBASE_PROJECT_ID: 'demo',
  VITE_FIREBASE_STORAGE_BUCKET: 'demo.appspot.com',
  VITE_FIREBASE_MESSAGING_SENDER_ID: '123',
  VITE_FIREBASE_APP_ID: '1:123:web:abc',
};

describe('readFirebaseConfig', () => {
  it('zwraca konfigurację, gdy wszystkie zmienne są ustawione', () => {
    const result = readFirebaseConfig(FULL);
    expect(result).toEqual({
      ok: true,
      options: {
        apiKey: 'key',
        authDomain: 'demo.firebaseapp.com',
        projectId: 'demo',
        storageBucket: 'demo.appspot.com',
        messagingSenderId: '123',
        appId: '1:123:web:abc',
      },
    });
  });

  it('wymienia brakujące i puste zmienne', () => {
    const result = readFirebaseConfig({
      ...FULL,
      VITE_FIREBASE_API_KEY: '  ',
      VITE_FIREBASE_APP_ID: undefined,
    });
    expect(result).toEqual({
      ok: false,
      missing: ['VITE_FIREBASE_API_KEY', 'VITE_FIREBASE_APP_ID'],
    });
  });
});
