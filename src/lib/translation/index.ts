import { cachedTranslationService } from './cached';
import { httpTranslationService } from './http';
import { mockTranslationService } from './mock';
import { TranslationError, type TranslationService } from './types';

const notConfigured: TranslationService = {
  translate: () =>
    Promise.reject(
      new TranslationError('not-configured', 'Tłumaczenie nie jest jeszcze skonfigurowane.'),
    ),
};

function create(): TranslationService {
  const url = import.meta.env.VITE_TRANSLATE_URL?.trim();
  if (url) return cachedTranslationService(httpTranslationService(url));
  if (import.meta.env.DEV) return mockTranslationService();
  return notConfigured;
}

export const translationService = create();
export { TranslationError } from './types';
export type { TranslationRequest, TranslationResult } from './types';
