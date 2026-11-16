import { useData } from './useData';

export function useSyncStatus() {
  const { sync, error, syncNow } = useData();
  return { ...sync, error, syncNow };
}
