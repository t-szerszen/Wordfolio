import { sha1Hex } from '../hash';
import { getCachedTranslation, putCachedTranslation } from '../storage/localStore';
import { parseTranslation } from './http';
import type { TranslationRequest, TranslationService } from './types';

async function cacheKey(request: TranslationRequest): Promise<string> {
  const raw = [
    request.sourceLang,
    request.targetLang,
    request.word.toLowerCase(),
    request.sentence,
  ].join('\u0000');
  return sha1Hex(raw);
}

/** Powtórne stuknięcie tego samego słowa w tym samym zdaniu nie odpytuje serwera ponownie. */
export function cachedTranslationService(inner: TranslationService): TranslationService {
  return {
    async translate(request, signal) {
      const key = await cacheKey(request);
      const cached = await getCachedTranslation(key).catch(() => null);
      if (cached) {
        try {
          return parseTranslation(cached);
        } catch {
          // Uszkodzony wpis w cache — pytamy serwer jeszcze raz.
        }
      }
      const result = await inner.translate(request, signal);
      await putCachedTranslation(key, result).catch(() => undefined);
      return result;
    },
  };
}
