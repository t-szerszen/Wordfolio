import { useEffect, useState } from 'react';
import {
  TranslationError,
  translationService,
  type TranslationRequest,
  type TranslationResult,
} from '../lib/translation';

export type TranslationState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ready'; result: TranslationResult }
  | { status: 'error'; message: string };

const DEBOUNCE_MS = 250;

function messageFor(error: unknown): string {
  if (error instanceof TranslationError) {
    if (error.kind === 'offline') {
      return 'Brak połączenia z siecią — tłumaczenie pojawi się, gdy wrócisz online. Słowo możesz zapisać już teraz.';
    }
    if (error.kind === 'not-configured') {
      return 'Tłumaczenie nie jest jeszcze skonfigurowane. Słowo możesz zapisać i uzupełnić ręcznie.';
    }
  }
  return 'Nie udało się pobrać tłumaczenia. Spróbuj ponownie za chwilę.';
}

/**
 * Tłumaczy zaznaczenie z małym opóźnieniem (przeciąganie uchwytów) i przerywa nieaktualne zapytania.
 * `request` musi być stabilny (useMemo po stronie wywołującego).
 */
export function useTranslation(
  request: TranslationRequest | null,
  attempt: number,
): TranslationState {
  const [state, setState] = useState<{
    request: TranslationRequest;
    attempt: number;
    value: TranslationState;
  } | null>(null);

  useEffect(() => {
    if (!request) return;
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      translationService.translate(request, controller.signal).then(
        (result) => {
          setState({ request, attempt, value: { status: 'ready', result } });
        },
        (error: unknown) => {
          if (!controller.signal.aborted) {
            setState({ request, attempt, value: { status: 'error', message: messageFor(error) } });
          }
        },
      );
    }, DEBOUNCE_MS);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [request, attempt]);

  if (!request) return { status: 'idle' };
  return state?.request === request && state.attempt === attempt
    ? state.value
    : { status: 'loading' };
}
