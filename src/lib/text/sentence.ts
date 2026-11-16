const MAX_LENGTH = 180;
const segmenters = new Map<string, Intl.Segmenter>();

function segmenter(lang: string): Intl.Segmenter {
  let instance = segmenters.get(lang);
  if (!instance) {
    instance = new Intl.Segmenter(lang || undefined, { granularity: 'sentence' });
    segmenters.set(lang, instance);
  }
  return instance;
}

export type SentenceContext = {
  /** Zdanie podzielone wokół zaznaczenia — do wyróżnienia słowa w kontekście. */
  before: string;
  match: string;
  after: string;
};

/**
 * Zdanie z akapitu, w którym leży zaznaczenie [start, end). Zbyt długie zdania przycina
 * do okna wokół słowa, bo do tłumaczenia i na fiszkę wystarczy najbliższy kontekst.
 */
export function sentenceAround(
  paragraph: string,
  start: number,
  end: number,
  lang: string,
): SentenceContext {
  const base = lang.toLowerCase().split('-')[0] ?? '';
  let from = 0;
  let to = paragraph.length;
  for (const segment of segmenter(base).segment(paragraph)) {
    const segmentEnd = segment.index + segment.segment.length;
    if (segment.index <= start && start < segmentEnd) {
      from = segment.index;
      to = Math.max(segmentEnd, end);
      break;
    }
  }
  let before = paragraph.slice(from, start).trimStart();
  let after = paragraph.slice(end, to).trimEnd();
  const match = paragraph.slice(start, end);
  const room = Math.max(40, MAX_LENGTH - match.length);
  if (before.length + after.length > room) {
    const half = Math.floor(room / 2);
    if (before.length > half)
      before = '…' + before.slice(before.length - half).replace(/^\S*\s/, '');
    if (after.length > room - Math.min(before.length, half)) {
      after = after.slice(0, room - Math.min(before.length, half)).replace(/\s\S*$/, '') + '…';
    }
  }
  return { before, match, after };
}

export function sentenceText(context: SentenceContext): string {
  return context.before + context.match + context.after;
}
