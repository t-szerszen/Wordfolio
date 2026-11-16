export type Token = {
  text: string;
  /** Czy token to słowo, które można stuknąć (a nie spacja czy interpunkcja). */
  word: boolean;
  /** Pozycja w tekście akapitu. */
  start: number;
};

const HYPHENS = new Set(['-', '‐', '‑']);
/** Elizje romańskie: „l’homme” → „l’” + „homme”, żeby tłumaczyć samo słowo. */
const ELISION =
  /^(l|d|j|m|n|s|t|c|qu|jusqu|lorsqu|puisqu|dell|all|dall|nell|sull|un)['’](?=\p{L})/iu;
const ELIDING_LANGUAGES = new Set(['fr', 'it', 'ca']);

const segmenters = new Map<string, Intl.Segmenter>();

function segmenter(lang: string): Intl.Segmenter {
  let instance = segmenters.get(lang);
  if (!instance) {
    instance = new Intl.Segmenter(lang || undefined, { granularity: 'word' });
    segmenters.set(lang, instance);
  }
  return instance;
}

function isLetterish(text: string): boolean {
  return /[\p{L}\p{N}]/u.test(text);
}

/** Łączy „daisy” „-” „chain” w jedno słowo, jak w designie. */
function mergeHyphenated(tokens: Token[]): Token[] {
  const result: Token[] = [];
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (!token) continue;
    const previous = result[result.length - 1];
    const next = tokens[i + 1];
    if (previous?.word && HYPHENS.has(token.text) && next?.word) {
      previous.text += token.text + next.text;
      i++;
      continue;
    }
    result.push({ ...token });
  }
  return result;
}

function splitElision(tokens: Token[]): Token[] {
  return tokens.flatMap((token) => {
    const match = token.word ? ELISION.exec(token.text) : null;
    if (!match) return [token];
    const prefix = match[0];
    return [
      { text: prefix, word: false, start: token.start },
      { text: token.text.slice(prefix.length), word: true, start: token.start + prefix.length },
    ];
  });
}

export function tokenize(text: string, lang: string): Token[] {
  const base = lang.toLowerCase().split('-')[0] ?? '';
  const tokens: Token[] = [];
  for (const segment of segmenter(base).segment(text)) {
    tokens.push({
      text: segment.segment,
      word: segment.isWordLike === true && isLetterish(segment.segment),
      start: segment.index,
    });
  }
  const merged = mergeHyphenated(tokens);
  return ELIDING_LANGUAGES.has(base) ? splitElision(merged) : merged;
}

/** Postać słowa do porównań i identyfikatora: małe litery, bez miękkich łączników. */
export function normalizeTerm(term: string, lang: string): string {
  return term
    .normalize('NFC')
    .replace(/­/g, '')
    .replace(/[’`]/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
    .toLocaleLowerCase(lang || undefined);
}
