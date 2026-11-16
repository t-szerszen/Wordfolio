import { afterEach, describe, expect, it, vi } from 'vitest';
import { httpTranslationService, parseTranslation } from './http';
import { TranslationError } from './types';

const REQUEST = {
  word: 'peeped',
  sentence: 'she had peeped into the book',
  sourceLang: 'en',
  targetLang: 'pl',
};

const noToken = () => Promise.resolve(null);

function stubOnline(online: boolean) {
  vi.stubGlobal('navigator', { onLine: online });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('httpTranslationService', () => {
  it('wysyła tylko słowo, zdanie i języki', async () => {
    stubOnline(true);
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValue(
        new Response(JSON.stringify({ translation: 'zerknęła', partOfSpeech: 'czasownik' })),
      );
    const result = await httpTranslationService(
      'https://proxy.test/translate',
      () => Promise.resolve('token-123'),
      fetcher,
    ).translate(REQUEST);
    expect(result).toEqual({
      translation: 'zerknęła',
      partOfSpeech: 'czasownik',
      definition: '',
      ipa: '',
    });
    const [url, init] = fetcher.mock.calls[0] ?? [];
    expect(url).toBe('https://proxy.test/translate');
    expect(JSON.parse(init?.body as string)).toEqual(REQUEST);
    expect(new Headers(init?.headers).get('Authorization')).toBe('Bearer token-123');
  });

  it('zgłasza brak sieci bez wysyłania zapytania', async () => {
    stubOnline(false);
    const fetcher = vi.fn<typeof fetch>();
    await expect(
      httpTranslationService('https://proxy.test', noToken, fetcher).translate(REQUEST),
    ).rejects.toMatchObject({
      kind: 'offline',
    });
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('zamienia błąd HTTP na czytelny błąd tłumaczenia', async () => {
    stubOnline(true);
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response('nope', { status: 502 }));
    await expect(
      httpTranslationService('https://proxy.test', noToken, fetcher).translate(REQUEST),
    ).rejects.toBeInstanceOf(TranslationError);
  });

  it('traktuje nieudane połączenie jako błąd serwera, gdy sieć jest', async () => {
    stubOnline(true);
    const fetcher = vi.fn<typeof fetch>().mockRejectedValue(new TypeError('Failed to fetch'));
    await expect(
      httpTranslationService('https://proxy.test', noToken, fetcher).translate(REQUEST),
    ).rejects.toMatchObject({
      kind: 'failed',
    });
  });
});

describe('parseTranslation', () => {
  it('odrzuca odpowiedź bez tłumaczenia i przycina długie pola', () => {
    expect(() => parseTranslation({})).toThrow(TranslationError);
    expect(parseTranslation({ translation: 'x'.repeat(500), ipa: 42 }).translation).toHaveLength(
      300,
    );
    expect(parseTranslation({ translation: 'ok', ipa: 42 }).ipa).toBe('');
  });
});
