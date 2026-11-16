export type ThemeChoice = 'papier' | 'lampka' | 'system';
export type ResolvedTheme = 'papier' | 'lampka';

const STORAGE_KEY = 'wordfolio:theme';
const THEME_COLORS: Record<ResolvedTheme, string> = { papier: '#f5ede0', lampka: '#221a15' };
const DARK_QUERY = '(prefers-color-scheme: dark)';

export function isThemeChoice(value: unknown): value is ThemeChoice {
  return value === 'papier' || value === 'lampka' || value === 'system';
}

export function resolveTheme(choice: ThemeChoice, prefersDark: boolean): ResolvedTheme {
  if (choice === 'system') return prefersDark ? 'lampka' : 'papier';
  return choice;
}

export function readCachedTheme(): ThemeChoice {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return isThemeChoice(value) ? value : 'system';
  } catch {
    return 'system';
  }
}

/** Kopia lokalna pozwala ustawić motyw przed pierwszym malowaniem, zanim dojdą ustawienia z Firestore. */
export function cacheTheme(choice: ThemeChoice): void {
  try {
    localStorage.setItem(STORAGE_KEY, choice);
  } catch {
    // Tryb prywatny bez localStorage — motyw i tak przyjdzie z synchronizacji.
  }
}

export function applyTheme(choice: ThemeChoice): () => void {
  const media = window.matchMedia(DARK_QUERY);
  const apply = () => {
    const theme = resolveTheme(choice, media.matches);
    document.documentElement.dataset.theme = theme;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', THEME_COLORS[theme]);
  };
  apply();
  media.addEventListener('change', apply);
  return () => {
    media.removeEventListener('change', apply);
  };
}
