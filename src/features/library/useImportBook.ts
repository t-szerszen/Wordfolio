import { useCallback, useState } from 'react';
import { useBooks } from '../../hooks/useBooks';
import { refreshLocalFiles } from '../../hooks/useLocalFiles';
import { useSettings } from '../../hooks/useSettings';
import { importBook, type ImportResult } from './importBook';

export function useImportBook() {
  const { books, saveBook } = useBooks();
  const { settings } = useSettings();
  const [busy, setBusy] = useState(false);

  const importFile = useCallback(
    async (file: File, expectedId?: string): Promise<ImportResult> => {
      setBusy(true);
      try {
        const result = await importBook(file, books, settings, expectedId);
        if (result.kind === 'added') saveBook(result.book);
        if (result.kind !== 'error') await refreshLocalFiles();
        return result;
      } catch {
        return { kind: 'error', message: 'Nie udało się wczytać pliku. Spróbuj ponownie.' };
      } finally {
        setBusy(false);
      }
    },
    [books, settings, saveBook],
  );

  return { importFile, busy };
}
