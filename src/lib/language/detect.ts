import { baseLanguage } from './names';

/** Najczęstsze krótkie słowa — wystarczą do odróżnienia języków pisanych alfabetem łacińskim. */
const STOPWORDS: Record<string, readonly string[]> = {
  en: [
    'the',
    'and',
    'of',
    'to',
    'a',
    'in',
    'is',
    'was',
    'that',
    'he',
    'she',
    'it',
    'with',
    'for',
    'had',
    'you',
    'not',
    'but',
    'his',
    'her',
  ],
  de: [
    'der',
    'die',
    'und',
    'das',
    'ist',
    'nicht',
    'ich',
    'sie',
    'er',
    'es',
    'ein',
    'eine',
    'zu',
    'mit',
    'den',
    'sich',
    'auf',
    'war',
    'dem',
    'auch',
  ],
  fr: [
    'le',
    'la',
    'les',
    'et',
    'de',
    'des',
    'un',
    'une',
    'est',
    'que',
    'il',
    'elle',
    'dans',
    'pas',
    'ne',
    'pour',
    'qui',
    'au',
    'du',
    'sur',
  ],
  es: [
    'el',
    'la',
    'los',
    'las',
    'y',
    'de',
    'que',
    'en',
    'un',
    'una',
    'es',
    'por',
    'con',
    'no',
    'se',
    'del',
    'su',
    'para',
    'como',
    'pero',
  ],
  it: [
    'il',
    'la',
    'di',
    'che',
    'e',
    'non',
    'un',
    'una',
    'per',
    'del',
    'della',
    'gli',
    'con',
    'si',
    'mi',
    'ma',
    'era',
    'come',
    'sono',
    'nel',
  ],
  pt: [
    'o',
    'a',
    'os',
    'as',
    'e',
    'de',
    'que',
    'não',
    'um',
    'uma',
    'do',
    'da',
    'em',
    'para',
    'com',
    'se',
    'por',
    'mas',
    'como',
    'ele',
  ],
  nl: [
    'de',
    'het',
    'een',
    'en',
    'van',
    'is',
    'dat',
    'niet',
    'ik',
    'hij',
    'zij',
    'met',
    'op',
    'te',
    'voor',
    'maar',
    'was',
    'aan',
    'ook',
    'zijn',
  ],
  sv: [
    'och',
    'att',
    'det',
    'som',
    'en',
    'på',
    'är',
    'av',
    'för',
    'med',
    'till',
    'den',
    'har',
    'inte',
    'jag',
    'om',
    'ett',
    'var',
    'hon',
    'han',
  ],
  pl: [
    'i',
    'w',
    'nie',
    'na',
    'się',
    'to',
    'że',
    'z',
    'do',
    'jest',
    'jak',
    'o',
    'ale',
    'co',
    'tak',
    'po',
    'jego',
    'by',
    'już',
    'czy',
  ],
  cs: [
    'a',
    'je',
    'se',
    'na',
    'v',
    'že',
    'to',
    's',
    'z',
    'do',
    'jsem',
    'ale',
    'jak',
    'tak',
    'by',
    'si',
    'jeho',
    'není',
    'pro',
    'když',
  ],
};

const SCRIPTS: readonly [RegExp, string][] = [
  [/[぀-ヿ]/g, 'ja'],
  [/[가-힯]/g, 'ko'],
  [/[一-鿿]/g, 'zh'],
  [/[Ͱ-Ͽ]/g, 'el'],
  [/[֐-׿]/g, 'he'],
  [/[؀-ۿ]/g, 'ar'],
];

const MIN_LETTERS = 40;

function count(text: string, pattern: RegExp): number {
  return text.match(pattern)?.length ?? 0;
}

function detectCyrillic(text: string): string {
  return /[іїєґ]/i.test(text) ? 'uk' : 'ru';
}

/**
 * Zgaduje język próbki tekstu. Zwraca null, gdy tekstu jest za mało albo wynik jest niepewny.
 * `hint` (np. /Lang z PDF) wygrywa, jeśli jest podany.
 */
export function detectLanguage(text: string, hint?: string | null): string | null {
  if (hint) {
    const base = baseLanguage(hint);
    if (/^[a-z]{2,3}$/.test(base)) return base;
  }
  const letters = count(text, /\p{L}/gu);
  if (letters < MIN_LETTERS) return null;

  for (const [pattern, lang] of SCRIPTS) {
    if (count(text, pattern) / letters > 0.3) return lang;
  }
  if (count(text, /[Ѐ-ӿ]/g) / letters > 0.3) return detectCyrillic(text);

  const words = text.toLowerCase().match(/\p{L}+/gu) ?? [];
  const frequency = new Map<string, number>();
  for (const word of words) frequency.set(word, (frequency.get(word) ?? 0) + 1);

  const scores = Object.entries(STOPWORDS)
    .map(([lang, list]) => ({
      lang,
      score: list.reduce((sum, word) => sum + (frequency.get(word) ?? 0), 0) / words.length,
    }))
    .sort((a, b) => b.score - a.score);

  const [best, second] = scores;
  if (!best || best.score < 0.05) return null;
  if (second && best.score < second.score * 1.25) return null;
  return best.lang;
}
