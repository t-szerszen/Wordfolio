import { readFirebaseConfig } from '../lib/firebase/config';
import { createFirebaseBackend, type Backend } from './backend';

export type BackendResult = { backend: Backend } | { missing: string[] };

export async function resolveBackend(): Promise<BackendResult> {
  const config = readFirebaseConfig(import.meta.env);
  if (config.ok) return { backend: createFirebaseBackend(config.options) };
  if (import.meta.env.DEV && import.meta.env.VITE_MEMORY_BACKEND === 'true') {
    const { createMemoryBackend } = await import('./memoryBackend');
    return { backend: createMemoryBackend() };
  }
  return { missing: config.missing };
}
