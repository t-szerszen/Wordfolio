import {
  TranslationError,
  type TranslationRequest,
  type TranslationResult,
  type TranslationService,
} from './types';

const TIMEOUT_MS = 12_000;

function isOnline(): boolean {
  return navigator.onLine;
}

function text(value: unknown, max: number): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

/** Odpowiedź proxy sprawdzamy pole po polu — to dane z sieci, a nie z naszego kodu. */
export function parseTranslation(body: unknown): TranslationResult {
  const data = typeof body === 'object' && body !== null ? (body as Record<string, unknown>) : {};
  const translation = text(data.translation, 300);
  if (!translation)
    throw new TranslationError('failed', 'Serwer tłumaczeń zwrócił pustą odpowiedź.');
  return {
    translation,
    partOfSpeech: text(data.partOfSpeech, 80),
    definition: text(data.definition, 600),
    ipa: text(data.ipa, 80),
  };
}

export type TokenProvider = () => Promise<string | null>;

/**
 * Klient endpointu tłumaczeń (docelowo małe proxy z kluczem API po stronie serwera).
 * Wysyłamy tylko słowo i jego zdanie — nigdy treści książki. Token logowania idzie w nagłówku,
 * żeby proxy mogło obsługiwać wyłącznie zalogowanych użytkowników.
 */
export function httpTranslationService(
  url: string,
  getToken: TokenProvider,
  fetcher: typeof fetch = fetch,
): TranslationService {
  return {
    async translate(request: TranslationRequest, signal?: AbortSignal) {
      if (!isOnline()) {
        throw new TranslationError('offline', 'Brak połączenia z siecią.');
      }
      const timeout = AbortSignal.timeout(TIMEOUT_MS);
      const token = await getToken().catch(() => null);
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;
      let response: Response;
      try {
        response = await fetcher(url, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            word: request.word,
            sentence: request.sentence,
            sourceLang: request.sourceLang,
            targetLang: request.targetLang,
          }),
          signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
        });
      } catch (error) {
        if (signal?.aborted) throw error;
        throw new TranslationError(
          isOnline() ? 'failed' : 'offline',
          'Nie udało się połączyć z serwerem tłumaczeń.',
        );
      }
      if (!response.ok) {
        throw new TranslationError(
          'failed',
          `Serwer tłumaczeń odpowiedział błędem ${response.status}.`,
        );
      }
      return parseTranslation(await response.json());
    },
  };
}
