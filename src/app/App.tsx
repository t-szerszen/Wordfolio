import { useEffect } from 'react';
import { AuthProvider } from '../features/auth/AuthProvider';
import { LoginScreen } from '../features/auth/LoginScreen';
import { useAuth } from '../features/auth/useAuth';
import { applyTheme, readCachedTheme } from '../features/settings/theme';
import type { Backend } from './backend';
import { ConfigMissingScreen } from './ConfigMissingScreen';
import type { BackendResult } from './resolveBackend';
import { SignedInApp } from './SignedInApp';

function AuthGate({ backend }: { backend: Backend }) {
  const { state } = useAuth();
  if (state.status === 'loading') return null;
  if (state.status === 'signed-out') return <LoginScreen />;
  return <SignedInApp key={state.user.uid} backend={backend} uid={state.user.uid} />;
}

export function App({ result }: { result: BackendResult }) {
  useEffect(() => applyTheme(readCachedTheme()), []);

  if ('missing' in result) return <ConfigMissingScreen missing={result.missing} />;
  return (
    <AuthProvider auth={result.backend.auth}>
      <AuthGate backend={result.backend} />
    </AuthProvider>
  );
}
