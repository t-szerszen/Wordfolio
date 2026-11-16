import { describe, expect, it } from 'vitest';
import { computeSyncStatus } from './syncStatus';

const server = { fromCache: false, hasPendingWrites: false };
const pending = { fromCache: true, hasPendingWrites: true };
const cached = { fromCache: true, hasPendingWrites: false };

describe('computeSyncStatus', () => {
  it('pokazuje offline bez sieci, nawet przy oczekujących zapisach', () => {
    expect(computeSyncStatus([pending], false, 10).state).toBe('offline');
  });

  it('pokazuje zapisywanie, gdy którakolwiek kolekcja ma oczekujące zmiany', () => {
    expect(computeSyncStatus([server, pending, server], true, null).state).toBe('saving');
  });

  it('czeka na serwer, gdy dane pochodzą jeszcze z cache', () => {
    expect(computeSyncStatus([server, cached], true, null).state).toBe('connecting');
    expect(computeSyncStatus([server, null], true, null).state).toBe('connecting');
  });

  it('zgłasza synchronizację, gdy wszystko przyszło z serwera', () => {
    expect(computeSyncStatus([server, server, server], true, 42)).toEqual({
      state: 'synced',
      lastSyncedAt: 42,
    });
  });
});
