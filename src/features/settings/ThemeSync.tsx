import { useEffect } from 'react';
import { useSettings } from '../../hooks/useSettings';
import { applyTheme, cacheTheme } from './theme';

/** Stosuje motyw z synchronizowanych ustawień i zapamiętuje go na potrzeby pierwszego malowania. */
export function ThemeSync() {
  const { settings } = useSettings();
  const theme = settings.theme;
  useEffect(() => {
    cacheTheme(theme);
    return applyTheme(theme);
  }, [theme]);
  return null;
}
