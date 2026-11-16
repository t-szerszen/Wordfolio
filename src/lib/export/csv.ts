import type { Word } from '../data/models';
import { STATUS_LABELS } from '../data/statusLabels';
import { dayKey } from '../streak';

const COLUMNS: readonly [string, (word: Word) => string][] = [
  ['słowo', (w) => w.term],
  ['tłumaczenie', (w) => w.translation],
  ['część mowy', (w) => w.pos],
  ['definicja', (w) => w.definition],
  ['wymowa', (w) => w.ipa],
  ['notatka', (w) => w.note],
  ['etykiety', (w) => w.tags.join(', ')],
  ['status', (w) => STATUS_LABELS[w.status]],
  ['język', (w) => w.lang],
  ['zdanie z książki', (w) => w.context.sentence],
  ['książka', (w) => w.context.bookTitle],
  ['strona', (w) => (w.context.page === null ? '' : String(w.context.page))],
  ['dodano', (w) => (w.createdAt === null ? '' : dayKey(new Date(w.createdAt)))],
  ['następna powtórka', (w) => dayKey(new Date(w.srs.due))],
];

function cell(value: string): string {
  // Formuły w arkuszach (=, +, -, @) neutralizujemy apostrofem, żeby tekst z książki nie wykonał się w Excelu.
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return /[";\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

/**
 * CSV z BOM (inaczej Excel psuje polskie znaki) i średnikiem jako separatorem — tak otwiera
 * pliki Excel z polskimi ustawieniami regionalnymi, a LibreOffice i Anki rozpoznają go same.
 */
export function wordsToCsv(words: readonly Word[]): string {
  const rows = [
    COLUMNS.map(([name]) => name),
    ...words.map((word) => COLUMNS.map(([, get]) => get(word))),
  ];
  return '\uFEFF' + rows.map((row) => row.map(cell).join(';')).join('\r\n') + '\r\n';
}

export function downloadText(content: string, fileName: string, type: string): void {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
}
