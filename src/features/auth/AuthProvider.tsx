import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { AuthBackend } from '../../app/backend';
import { describeAuthError } from '../../lib/firebase/auth';
import { AuthContext, type AuthContextValue, type AuthState } from './authContext';

type AuthProviderProps = {
  auth: AuthBackend;
  children: ReactNode;
};

export function AuthProvider({ auth, children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({ status: 'loading' });

  useEffect(() => {
    let active = true;
    void auth.completeRedirect().then((error) => {
      const message = error ? describeAuthError(error) : null;
      if (active && message) {
        setState((current) =>
          current.status === 'signed-in'
            ? current
            : { status: 'signed-out', error: message, busy: false },
        );
      }
    });
    const unsubscribe = auth.watch((user) => {
      setState((current) =>
        user
          ? { status: 'signed-in', user }
          : {
              status: 'signed-out',
              error: current.status === 'signed-out' ? current.error : null,
              busy: false,
            },
      );
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, [auth]);

  const signIn = useCallback(async () => {
    setState({ status: 'signed-out', error: null, busy: true });
    try {
      await auth.signIn();
    } catch (error) {
      setState({ status: 'signed-out', error: describeAuthError(error), busy: false });
    }
  }, [auth]);

  const signOut = useCallback(() => auth.signOut(), [auth]);

  const value = useMemo<AuthContextValue>(
    () => ({ state, signIn, signOut }),
    [state, signIn, signOut],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
