import type { FirebaseOptions } from 'firebase/app';

const ENV_KEYS = {
  apiKey: 'VITE_FIREBASE_API_KEY',
  authDomain: 'VITE_FIREBASE_AUTH_DOMAIN',
  projectId: 'VITE_FIREBASE_PROJECT_ID',
  storageBucket: 'VITE_FIREBASE_STORAGE_BUCKET',
  messagingSenderId: 'VITE_FIREBASE_MESSAGING_SENDER_ID',
  appId: 'VITE_FIREBASE_APP_ID',
} as const;

type ConfigKey = keyof typeof ENV_KEYS;

export type FirebaseConfigResult =
  { ok: true; options: FirebaseOptions } | { ok: false; missing: string[] };

export function readFirebaseConfig(env: Record<string, unknown>): FirebaseConfigResult {
  const options: Partial<Record<ConfigKey, string>> = {};
  const missing: string[] = [];
  for (const [key, envName] of Object.entries(ENV_KEYS) as [ConfigKey, string][]) {
    const value = env[envName];
    if (typeof value === 'string' && value.trim() !== '') options[key] = value.trim();
    else missing.push(envName);
  }
  return missing.length > 0 ? { ok: false, missing } : { ok: true, options };
}
