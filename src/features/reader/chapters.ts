import type { Chapter } from '../../lib/pdf/outline';

const ROMAN: readonly [number, string][] = [
  [1000, 'M'],
  [900, 'CM'],
  [500, 'D'],
  [400, 'CD'],
  [100, 'C'],
  [90, 'XC'],
  [50, 'L'],
  [40, 'XL'],
  [10, 'X'],
  [9, 'IX'],
  [5, 'V'],
  [4, 'IV'],
  [1, 'I'],
];

export function toRoman(value: number): string {
  let rest = Math.max(1, Math.floor(value));
  let result = '';
  for (const [amount, symbol] of ROMAN) {
    while (rest >= amount) {
      result += symbol;
      rest -= amount;
    }
  }
  return result;
}

export type CurrentChapter = { number: string; title: string };

export function chapterAt(chapters: readonly Chapter[], page: number): CurrentChapter | null {
  let index = -1;
  chapters.forEach((chapter, i) => {
    if (chapter.page <= page) index = i;
  });
  const chapter = chapters[index];
  return chapter ? { number: toRoman(index + 1), title: chapter.title } : null;
}

/** „rozdz. I · s. 3 z 98” — bez spisu treści tylko numer strony. */
export function positionLabel(
  chapter: CurrentChapter | null,
  page: number,
  pageCount: number,
): string {
  const pages = `s. ${page} z ${pageCount}`;
  return chapter ? `rozdz. ${chapter.number} · ${pages}` : pages;
}
