/** Fragment tekstu z pdf.js sprowadzony do tego, czego potrzebuje składanie akapitów. */
export type RawItem = {
  str: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

export type Paragraph = {
  text: string;
  heading: boolean;
};

type Line = {
  text: string;
  left: number;
  right: number;
  y: number;
  size: number;
};

const LIGATURES: Record<string, string> = {
  ﬀ: 'ff',
  ﬁ: 'fi',
  ﬂ: 'fl',
  ﬃ: 'ffi',
  ﬄ: 'ffl',
  ﬅ: 'st',
  ﬆ: 'st',
};

const SOFT_HYPHEN = '­';
const HYPHENS = /[-‐¬]$/u;
const LOWERCASE_START = /^\p{Ll}/u;
const LETTER_END = /\p{L}[-‐¬]$/u;
const SENTENCE_END = /[.!?:;…"”»’)\]]$/u;
const PAGE_NUMBER = /^[\s\-–—.]*(\d{1,4}|[ivxlcdm]{1,8})[\s\-–—.]*$/iu;

function normalize(text: string): string {
  return text.replace(/[ﬀ-ﬆ]/gu, (ch) => LIGATURES[ch] ?? ch).replace(/\s+/gu, ' ');
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)] ?? 0;
}

function percentile(values: number[], p: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * p))] ?? 0;
}

/** Elementy w kolejności strumienia PDF łączy w linie; nowa linia zaczyna się przy zmianie wysokości. */
function buildLines(items: readonly RawItem[]): Line[] {
  const lines: Line[] = [];
  let current: Line | null = null;
  for (const item of items) {
    if (item.str === '') continue;
    const size = Math.max(item.height, 1);
    const sameLine =
      current !== null &&
      Math.abs(item.y - current.y) < Math.min(size, current.size) * 0.5 &&
      item.x >= current.left - size;
    if (current && sameLine) {
      const gap = item.x - current.right;
      const needsSpace =
        gap > size * 0.15 && !current.text.endsWith(' ') && !item.str.startsWith(' ');
      current.text += (needsSpace ? ' ' : '') + item.str;
      current.right = Math.max(current.right, item.x + item.width);
      current.size = Math.max(current.size, size);
    } else {
      if (current) lines.push(current);
      current = { text: item.str, left: item.x, right: item.x + item.width, y: item.y, size };
    }
  }
  if (current) lines.push(current);
  return lines
    .map((line) => ({ ...line, text: normalize(line.text).trim() }))
    .filter((line) => line.text !== '');
}

/** Pomija samotne numery stron na górze i dole strony. */
function dropPageNumbers(lines: Line[]): Line[] {
  const result = [...lines];
  const first = result[0];
  if (first && PAGE_NUMBER.test(first.text)) result.shift();
  const last = result[result.length - 1];
  if (last && PAGE_NUMBER.test(last.text)) result.pop();
  return result;
}

/** Łączy dwie linie tego samego akapitu, usuwając dzielenie wyrazów na końcu linii. */
export function joinLines(previous: string, next: string): string {
  if (previous.endsWith(SOFT_HYPHEN)) return previous.slice(0, -1) + next;
  if (HYPHENS.test(previous) && LETTER_END.test(previous)) {
    // Mała litera na początku następnej linii oznacza wyraz podzielony przy łamaniu;
    // wielka (np. „Anglo-Saxon”) — łącznik należy do słowa.
    return LOWERCASE_START.test(next) ? previous.slice(0, -1) + next : previous + next;
  }
  if (previous.endsWith('—') || previous.endsWith('/')) return previous + next;
  return `${previous} ${next}`;
}

export function layoutParagraphs(items: readonly RawItem[]): Paragraph[] {
  const lines = dropPageNumbers(buildLines(items));
  if (lines.length === 0) return [];

  const bodySize = median(lines.map((l) => l.size));
  const gaps: number[] = [];
  for (let i = 1; i < lines.length; i++) {
    const gap = (lines[i - 1]?.y ?? 0) - (lines[i]?.y ?? 0);
    if (gap > 0) gaps.push(gap);
  }
  const lineGap = median(gaps) || bodySize * 1.2;
  const bodyLines = lines.filter((l) => l.size <= bodySize * 1.15);
  const left = percentile(
    bodyLines.map((l) => l.left),
    0.1,
  );
  const right = percentile(
    bodyLines.map((l) => l.right),
    0.9,
  );

  const paragraphs: Paragraph[] = [];
  let text = '';
  let heading = false;
  let previous: Line | null = null;

  const flush = () => {
    if (text.trim() !== '') paragraphs.push({ text: text.trim(), heading });
    text = '';
  };

  for (const line of lines) {
    const isHeading = line.size > bodySize * 1.2;
    let startsNew = previous === null;
    if (previous) {
      const gap = previous.y - line.y;
      const isIndented = (l: Line) => l.left > left + bodySize * 0.8 && l.left < (left + right) / 2;
      const indented = isIndented(line) && !isIndented(previous);
      const previousShort =
        previous.right < right - bodySize * 2 && SENTENCE_END.test(previous.text);
      startsNew =
        isHeading !== heading ||
        gap > lineGap * 1.45 ||
        gap < 0 ||
        (!isHeading && indented) ||
        (!isHeading && previousShort);
    }
    if (startsNew) {
      flush();
      text = line.text;
      heading = isHeading;
    } else {
      text = joinLines(text, line.text);
    }
    previous = line;
  }
  flush();
  return paragraphs;
}
