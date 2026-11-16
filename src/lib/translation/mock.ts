import type { TranslationResult, TranslationService } from './types';

/** Kilka haseł z designu, żeby w trybie deweloperskim arkusz wyglądał realistycznie. */
const ENTRIES: Record<string, TranslationResult> = {
  peeped: {
    translation: 'zerknęła, zajrzała ukradkiem',
    partOfSpeech: 'czasownik · od „peep”',
    definition: 'Spojrzeć szybko i po cichu — przez szparę albo przez czyjeś ramię.',
    ipa: '/piːpt/',
  },
  tired: {
    translation: 'zmęczona; mająca czegoś dość',
    partOfSpeech: 'przymiotnik',
    definition: 'Taka, która potrzebuje odpoczynku — albo ma już czegoś dość.',
    ipa: '/ˈtaɪəd/',
  },
  bank: {
    translation: 'brzeg (rzeki)',
    partOfSpeech: 'rzeczownik',
    definition: 'Pochyły teren tuż przy rzece albo jeziorze.',
    ipa: '/bæŋk/',
  },
  'out of the way': {
    translation: 'dziwny, nietypowy',
    partOfSpeech: 'wyrażenie',
    definition: 'Odbiegający od normy — nie taki, jakiego się spodziewasz.',
    ipa: '',
  },
};

const DELAY_MS = 600;

export function mockTranslationService(): TranslationService {
  return {
    translate(request, signal) {
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          const key = request.word.toLowerCase();
          resolve(
            ENTRIES[key] ?? {
              translation: `„${request.word}” — tłumaczenie testowe`,
              partOfSpeech: '',
              definition: 'Tryb deweloperski bez serwera tłumaczeń (brak VITE_TRANSLATE_URL).',
              ipa: '',
            },
          );
        }, DELAY_MS);
        signal?.addEventListener('abort', () => {
          clearTimeout(timer);
          reject(signal.reason instanceof Error ? signal.reason : new Error('aborted'));
        });
      });
    },
  };
}
