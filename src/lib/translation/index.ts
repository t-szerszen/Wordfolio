import { cachedTranslationService } from './cached';
import { httpTranslationService, type TokenProvider } from './http';
import { mockTranslationService } from './mock';
import { TranslationError, type TranslationService } from './types';

const notConfigured: TranslationService = {
  translate: () =>
    Promise.reject(
      new TranslationError('not-configured', 'Tłumaczenie nie jest jeszcze skonfigurowane.'),
    ),
};

let tokenProvider: TokenProvider = () => Promise.resolve(null);

/** Aplikacja po zalogowaniu podaje, skąd brać token dla proxy tłumaczeń. */
export function setTranslationTokenProvider(provider: TokenProvider): void {
  tokenProvider = provider;
}

function create(): TranslationService {
  const url = import.meta.env.VITE_TRANSLATE_URL?.trim();
  if (url) return cachedTranslationService(httpTranslationService(url, () => tokenProvider()));
  if (import.meta.env.DEV) return mockTranslationService();
  return notConfigured;
}

export const translationService = create();
export { TranslationError } from './types';
export type { TranslationRequest, TranslationResult } from './types';
