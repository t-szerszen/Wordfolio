import { useContext } from 'react';
import type { AuthUser } from '../../lib/firebase/auth';
import { AuthContext, type AuthContextValue } from './authContext';

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth wymaga AuthProvider');
  return value;
}

export function useCurrentUser(): AuthUser {
  const { state } = useAuth();
  if (state.status !== 'signed-in')
    throw new Error('useCurrentUser wymaga zalogowanego użytkownika');
  return state.user;
}
