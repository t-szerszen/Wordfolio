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

/** Skróty, po których Intl.Segmenter błędnie kończy zdanie („Mr. Smith”, „np. dom”, „J. R. R.”). */
const ABBREVIATION =
  /(?:^|[\s(„"'‘“])(?:\p{Lu}|Mr|Mrs|Ms|Dr|St|Mt|Prof|Sr|Jr|No|vs|etc|e\.g|i\.e|cf|np|tzn|tj|ok|godz|ul|prof|dr|nr|bzw|z\.B|d\.h|usw|Mme|Mlle|Sra|Sr)\.\s*$/u;

type Segment = { start: number; end: number };

function sentences(paragraph: string, lang: string): Segment[] {
  const merged: Segment[] = [];
  for (const segment of segmenter(lang).segment(paragraph)) {
    const current = { start: segment.index, end: segment.index + segment.segment.length };
    const previous = merged[merged.length - 1];
    if (previous && ABBREVIATION.test(paragraph.slice(previous.start, previous.end))) {
      previous.end = current.end;
    } else {
      merged.push(current);
    }
  }
  return merged;
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
  for (const segment of sentences(paragraph, base)) {
    if (segment.start <= start && start < segment.end) {
      from = segment.start;
      to = Math.max(segment.end, end);
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
