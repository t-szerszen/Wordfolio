const PLACEHOLDER_TITLES = /^(untitled|unknown|bez tytułu|microsoft word.*|document\d*|\s*)$/i;

/** Tytuł z metadanych PDF bywa pusty albo techniczny — wtedy bierzemy nazwę pliku. */
export function bookTitle(metadataTitle: string, fileName: string): string {
  const title = metadataTitle.trim();
  if (title.length > 2 && !PLACEHOLDER_TITLES.test(title) && !/\.(pdf|docx?|indd)$/i.test(title)) {
    return title.slice(0, 300);
  }
  const base = fileName
    .replace(/\.pdf$/i, '')
    .replace(/[_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return (base || 'Bez tytułu').slice(0, 300);
}
