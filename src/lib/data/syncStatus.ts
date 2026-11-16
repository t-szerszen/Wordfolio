import type { SnapshotMeta } from './repositories';

export type SyncState = 'synced' | 'saving' | 'offline' | 'connecting';

export type SyncStatus = {
  state: SyncState;
  lastSyncedAt: number | null;
};

/** Łączy metadane migawek wszystkich kolekcji w jeden status widoczny w ustawieniach. */
export function computeSyncStatus(
  metas: readonly (SnapshotMeta | null)[],
  online: boolean,
  lastSyncedAt: number | null,
): SyncStatus {
  if (!online) return { state: 'offline', lastSyncedAt };
  if (metas.some((m) => m?.hasPendingWrites)) return { state: 'saving', lastSyncedAt };
  if (metas.some((m) => m === null || m.fromCache)) return { state: 'connecting', lastSyncedAt };
  return { state: 'synced', lastSyncedAt };
}
