const NAMES: Record<string, string> = {
  pl: 'polski',
  en: 'angielski',
  de: 'niemiecki',
  fr: 'francuski',
  es: 'hiszpański',
  it: 'włoski',
  pt: 'portugalski',
  nl: 'niderlandzki',
  sv: 'szwedzki',
  no: 'norweski',
  da: 'duński',
  fi: 'fiński',
  cs: 'czeski',
  sk: 'słowacki',
  hu: 'węgierski',
  ro: 'rumuński',
  tr: 'turecki',
  ru: 'rosyjski',
  uk: 'ukraiński',
  el: 'grecki',
  ar: 'arabski',
  he: 'hebrajski',
  ja: 'japoński',
  ko: 'koreański',
  zh: 'chiński',
};

/** Języki do wyboru w ustawieniach, w kolejności alfabetycznej nazw. */
export const LANGUAGES = Object.entries(NAMES)
  .map(([code, name]) => ({ code, name }))
  .sort((a, b) => a.name.localeCompare(b.name, 'pl'));

export function languageName(code: string): string {
  return NAMES[baseLanguage(code)] ?? code.toUpperCase();
}

/** „en-GB” → „en”. */
export function baseLanguage(code: string): string {
  return code.toLowerCase().split(/[-_]/)[0] ?? '';
}
