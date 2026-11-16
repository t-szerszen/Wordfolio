/// <reference types="vite/client" />

type ImportMetaEnv = {
  readonly VITE_FIREBASE_API_KEY?: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN?: string;
  readonly VITE_FIREBASE_PROJECT_ID?: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET?: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID?: string;
  readonly VITE_FIREBASE_APP_ID?: string;
  readonly VITE_TRANSLATE_URL?: string;
  readonly VITE_MEMORY_BACKEND?: string;
};

type ImportMeta = {
  readonly env: ImportMetaEnv;
};
