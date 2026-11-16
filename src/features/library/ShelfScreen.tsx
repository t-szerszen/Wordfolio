import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { Icon } from '../../components/Icon';
import { Logo } from '../../components/Logo';
import { Notice } from '../../components/Notice';
import { Screen } from '../../components/Screen';
import { useBooks } from '../../hooks/useBooks';
import { useDueWords } from '../../hooks/useDueWords';
import { useLocalFiles } from '../../hooks/useLocalFiles';
import { useNow } from '../../hooks/useNow';
import { useSettings } from '../../hooks/useSettings';
import { useWords } from '../../hooks/useWords';
import type { Book } from '../../lib/data/models';
import { computeStreak, dayKey } from '../../lib/streak';
import { Bookshelf } from './Bookshelf';
import { ContinueCard } from './ContinueCard';
import { EmptyShelf } from './EmptyShelf';
import { dayLabelFor, greetingFor } from './greeting';
import { MissingFileDialog } from './MissingFileDialog';
import { ReviewNote } from './ReviewNote';
import { StreakCard } from './StreakCard';
import { useImportBook } from './useImportBook';
import styles from './ShelfScreen.module.css';

function currentBook(books: readonly Book[]): Book | null {
  const byRecency = (b: Book) => b.lastOpenedAt ?? b.createdAt ?? 0;
  return books.reduce<Book | null>(
    (best, b) => (!best || byRecency(b) > byRecency(best) ? b : best),
    null,
  );
}

function matches(book: Book, query: string): boolean {
  const q = query.trim().toLocaleLowerCase();
  return q === '' || `${book.title} ${book.author}`.toLocaleLowerCase().includes(q);
}

export function ShelfScreen() {
  const { books, loading } = useBooks();
  const { words } = useWords();
  const dueCount = useDueWords().length;
  const { settings } = useSettings();
  const files = useLocalFiles();
  const { importFile, busy } = useImportBook();
  const navigate = useNavigate();
  const now = useNow();
  const inputRef = useRef<HTMLInputElement>(null);
  const [expectedId, setExpectedId] = useState<string | null>(null);
  const [missingId, setMissingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');

  const sorted = useMemo(
    () => [...books].sort((a, b) => (a.createdAt ?? Infinity) - (b.createdAt ?? Infinity)),
    [books],
  );
  const visible = sorted.filter((b) => matches(b, query));
  const reading = currentBook(books);
  const streak = computeStreak(settings.reviewDays, dayKey(new Date(now)));
  const missingBook = books.find((b) => b.id === missingId) ?? null;

  const pickFile = (bookId: string | null) => {
    setExpectedId(bookId);
    setError(null);
    inputRef.current?.click();
  };

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    const result = await importFile(file, expectedId ?? undefined);
    setMissingId(null);
    setError(result.kind === 'error' ? result.message : null);
    if (result.kind === 'error') return;
    if (result.kind === 'restored') void navigate(`/czytaj/${result.book.id}`);
  };

  return (
    <Screen>
      <header className={styles.header}>
        <span className={styles.logo}>
          <Logo size={30} label="Wordfolio" />
        </span>
        <span className={styles.day}>{dayLabelFor(new Date(now))}</span>
        {books.length > 0 && (
          <button
            type="button"
            className={styles.iconButton}
            aria-label="Szukaj na półce"
            aria-expanded={searchOpen}
            aria-controls="shelf-search"
            onClick={() => {
              setSearchOpen(!searchOpen);
              setQuery('');
            }}
          >
            <Icon name={searchOpen ? 'close' : 'search'} />
          </button>
        )}
      </header>

      {searchOpen && (
        <div className={styles.search} id="shelf-search">
          <Icon name="search" size={22} />
          <label htmlFor="shelf-query" className="visually-hidden">
            Szukaj tytułu lub autora
          </label>
          <input
            id="shelf-query"
            type="search"
            className={styles.searchInput}
            placeholder="Tytuł lub autor"
            value={query}
            // eslint-disable-next-line jsx-a11y/no-autofocus -- pole pojawia się na wyraźne żądanie
            autoFocus
            onChange={(event) => {
              setQuery(event.target.value);
            }}
          />
        </div>
      )}

      {error && (
        <Notice
          onDismiss={() => {
            setError(null);
          }}
        >
          {error}
        </Notice>
      )}
      <p className="visually-hidden" aria-live="polite">
        {busy ? 'Wczytuję książkę…' : ''}
      </p>
      {busy && <p className={styles.busy}>wczytuję książkę…</p>}

      {!loading && books.length === 0 && (
        <EmptyShelf
          busy={busy}
          onAdd={() => {
            pickFile(null);
          }}
        />
      )}

      {books.length > 0 && (
        <div className={styles.content}>
          {!searchOpen && (
            <>
              <h1 className={styles.title}>{greetingFor(new Date(now))}</h1>
              <div className={styles.cards}>
                {reading && (
                  <ContinueCard
                    book={reading}
                    available={files.has(reading.id)}
                    onMissing={setMissingId}
                  />
                )}
                <ReviewNote dueCount={dueCount} wordCount={words.length} />
                <StreakCard streak={streak} />
              </div>
            </>
          )}
          {searchOpen && <h1 className="visually-hidden">Szukaj na półce</h1>}
          {visible.length > 0 ? (
            <Bookshelf
              books={visible}
              totalCount={books.length}
              isAvailable={files.has}
              onAdd={() => {
                pickFile(null);
              }}
              onMissing={setMissingId}
            />
          ) : (
            <p className={styles.noResults}>Nic tu nie pasuje do „{query.trim()}”.</p>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="visually-hidden"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(event) => {
          void onFile(event.target.files?.[0]);
          event.target.value = '';
        }}
      />
      <MissingFileDialog
        book={missingBook}
        busy={busy}
        onUpload={() => {
          if (missingBook) pickFile(missingBook.id);
        }}
        onClose={() => {
          setMissingId(null);
        }}
      />
    </Screen>
  );
}
