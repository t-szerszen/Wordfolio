import { useSyncExternalStore } from 'react';

export type Breakpoint = 'phone' | 'tablet' | 'desktop';

const TABLET = '(min-width: 720px)';
const DESKTOP = '(min-width: 1100px)';

function current(): Breakpoint {
  if (window.matchMedia(DESKTOP).matches) return 'desktop';
  if (window.matchMedia(TABLET).matches) return 'tablet';
  return 'phone';
}

function subscribe(onChange: () => void): () => void {
  const queries = [window.matchMedia(TABLET), window.matchMedia(DESKTOP)];
  queries.forEach((q) => {
    q.addEventListener('change', onChange);
  });
  return () => {
    queries.forEach((q) => {
      q.removeEventListener('change', onChange);
    });
  };
}

/** Te same progi co w CSS (720 px i 1100 px). */
export function useBreakpoint(): Breakpoint {
  return useSyncExternalStore(subscribe, current);
}
