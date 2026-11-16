import { createContext } from 'react';
import type { AuthUser } from '../../lib/firebase/auth';

export type AuthState =
  | { status: 'loading' }
  | { status: 'signed-out'; error: string | null; busy: boolean }
  | { status: 'signed-in'; user: AuthUser };

export type AuthContextValue = {
  state: AuthState;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
