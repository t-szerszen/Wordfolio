import { FirebaseError } from 'firebase/app';
import {
  getRedirectResult,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  type Auth,
  type User,
} from 'firebase/auth';

export type AuthUser = {
  uid: string;
  displayName: string;
  email: string;
};

/** Błędy, po których okno logowania nie zadziała, ale przekierowanie ma szansę. */
const REDIRECT_FALLBACK = new Set([
  'auth/popup-blocked',
  'auth/operation-not-supported-in-this-environment',
  'auth/web-storage-unsupported',
]);

const SILENT = new Set(['auth/popup-closed-by-user', 'auth/cancelled-popup-request']);

function toAuthUser(user: User): AuthUser {
  return { uid: user.uid, displayName: user.displayName ?? '', email: user.email ?? '' };
}

function provider(): GoogleAuthProvider {
  const google = new GoogleAuthProvider();
  google.setCustomParameters({ prompt: 'select_account' });
  return google;
}

export function watchAuth(auth: Auth, onChange: (user: AuthUser | null) => void): () => void {
  return onAuthStateChanged(auth, (user) => {
    onChange(user ? toAuthUser(user) : null);
  });
}

export async function signInWithGoogle(auth: Auth): Promise<void> {
  try {
    await signInWithPopup(auth, provider());
  } catch (error) {
    if (error instanceof FirebaseError && REDIRECT_FALLBACK.has(error.code)) {
      await signInWithRedirect(auth, provider());
      return;
    }
    throw error;
  }
}

/** Zwraca błąd z powrotu po przekierowaniu (jeśli był), żeby pokazać go na ekranie logowania. */
export async function completeRedirect(auth: Auth): Promise<unknown> {
  try {
    await getRedirectResult(auth);
    return null;
  } catch (error) {
    return error;
  }
}

/** Token ID dla proxy tłumaczeń — pozwala mu wpuszczać tylko zalogowanych użytkowników. */
export async function idToken(auth: Auth): Promise<string | null> {
  return (await auth.currentUser?.getIdToken()) ?? null;
}

export function signOutUser(auth: Auth): Promise<void> {
  return signOut(auth);
}

export function describeAuthError(error: unknown): string | null {
  const code = error instanceof FirebaseError ? error.code : '';
  if (SILENT.has(code)) return null;
  switch (code) {
    case 'auth/network-request-failed':
      return 'Brak połączenia z siecią. Spróbuj ponownie, gdy będziesz online.';
    case 'auth/unauthorized-domain':
      return 'Ta domena nie jest dozwolona w Firebase. Dodaj ją w Authentication → Settings → Authorized domains.';
    case 'auth/operation-not-allowed':
      return 'Logowanie przez Google nie jest włączone w projekcie Firebase.';
    case 'auth/too-many-requests':
      return 'Zbyt wiele prób logowania. Odczekaj chwilę i spróbuj ponownie.';
    default:
      return 'Nie udało się zalogować. Spróbuj ponownie.';
  }
}
