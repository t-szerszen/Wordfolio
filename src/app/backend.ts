import type { FirebaseOptions } from 'firebase/app';
import {
  completeRedirect,
  idToken,
  signInWithGoogle,
  signOutUser,
  watchAuth,
  type AuthUser,
} from '../lib/firebase/auth';
import type { DataBackend } from '../lib/firebase/dataBackend';
import { initFirebase } from '../lib/firebase/services';

export type { DataBackend, Repositories } from '../lib/firebase/dataBackend';

export type AuthBackend = {
  watch: (onChange: (user: AuthUser | null) => void) => () => void;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  completeRedirect: () => Promise<unknown>;
  idToken: () => Promise<string | null>;
};

/** Jedyne miejsce, które łączy Firebase z resztą aplikacji. */
export type Backend = {
  auth: AuthBackend;
  loadData: () => Promise<DataBackend>;
};

export function createFirebaseBackend(options: FirebaseOptions): Backend {
  const { app, auth } = initFirebase(options);
  let data: Promise<DataBackend> | null = null;
  return {
    auth: {
      watch: (onChange) => watchAuth(auth, onChange),
      signIn: () => signInWithGoogle(auth),
      signOut: () => signOutUser(auth),
      completeRedirect: () => completeRedirect(auth),
      idToken: () => idToken(auth),
    },
    loadData: () => {
      data ??= import('../lib/firebase/dataBackend').then((m) => m.createDataBackend(app));
      return data;
    },
  };
}
