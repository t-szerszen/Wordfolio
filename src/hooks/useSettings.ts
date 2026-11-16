import { useCallback } from 'react';
import type { Settings, SettingsInput } from '../lib/data/models';
import { useData } from './useData';

export function useSettings(): {
  settings: Settings;
  updateSettings: (patch: Partial<SettingsInput>) => void;
} {
  const { settings, saveSettings } = useData();
  const updateSettings = useCallback(
    (patch: Partial<SettingsInput>) => {
      saveSettings({ ...settings, ...patch });
    },
    [settings, saveSettings],
  );
  return { settings, updateSettings };
}
