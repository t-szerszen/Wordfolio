import { useData } from './useData';

export function useSettings() {
  const { settings, updateSettings, addReviewDay } = useData();
  return { settings, updateSettings, addReviewDay };
}
