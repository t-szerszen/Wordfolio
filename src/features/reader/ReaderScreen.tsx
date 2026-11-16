import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { Navigate, useParams } from 'react-router';
import { Button } from '../../components/Button';
import { TabBar } from '../../components/TabBar';
import { useBooks } from '../../hooks/useBooks';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { useDueWords } from '../../hooks/useDueWords';
import { useSettings } from '../../hooks/useSettings';
import { useWordStatuses } from '../../hooks/useWordStatuses';
import type { Book } from '../../lib/data/models';
import type { PDFDocumentProxy } from '../../lib/pdf/document';
import type { Chapter } from '../../lib/pdf/outline';
import { useImportBook } from '../library/useImportBook';
import { chapterAt, positionLabel } from './chapters';
import { PageNav } from './PageNav';
import { ReaderFooter } from './ReaderFooter';
import { ReaderHeader } from './ReaderHeader';
import { ReaderMessage } from './ReaderMessage';
import { ReaderPage } from './ReaderPage';
import { moveEdge, type Selection } from './selection';
import { TypographyPanel } from './TypographyPanel';
import { MARGIN_SIDE, MEASURE_DESKTOP, MEASURE_TABLET } from './typography';
import { useBookDocument } from './useBookDocument';
import { usePage } from './usePage';
import { useReadingPosition } from './useReadingPosition';
import styles from './ReaderScreen.module.css';

export function ReaderScreen() {
  const { bookId = '' } = useParams();
  const { books, loading } = useBooks();
  if (loading) return null;
  const book = books.find((b) => b.id === bookId);
  if (!book) return <Navigate to="/" replace />;
  return <BookReader key={book.id} book={book} />;
}

function MissingFile({ book, onRestored }: { book: Book; onRestored: () => void }) {
  const { importFile, busy } = useImportBook();
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  return (
    <ReaderMessage
      title="Plik niedostępny na tym urządzeniu"
      action={
        <>
          <Button icon="upload" disabled={busy} onClick={() => inputRef.current?.click()}>
            {busy ? 'Wczytuję…' : 'Wgraj plik ponownie'}
          </Button>
          {error && <p role="alert">{error}</p>}
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf,.pdf"
            className="visually-hidden"
            tabIndex={-1}
            aria-hidden="true"
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = '';
              if (!file) return;
              void importFile(file, book.id).then((result) => {
                if (result.kind === 'error') setError(result.message);
                else onRestored();
              });
            }}
          />
        </>
      }
    >
      „{book.title}” jest na Twojej półce, ale sam PDF został na innym urządzeniu. Wgraj ten sam
      plik, a czytanie wróci do strony {book.page}.
    </ReaderMessage>
  );
}

function BookReader({ book }: { book: Book }) {
  const [reloadKey, setReloadKey] = useState(0);
  const document = useBookDocument(book.id, reloadKey);

  if (document.status === 'missing') {
    return (
      <div className={styles.reader}>
        <MissingFile
          book={book}
          onRestored={() => {
            setReloadKey((k) => k + 1);
          }}
        />
      </div>
    );
  }
  if (document.status === 'error') {
    return (
      <div className={styles.reader}>
        <ReaderMessage title="Nie udało się otworzyć książki">
          Plik może być uszkodzony. Spróbuj wgrać go jeszcze raz z półki.
        </ReaderMessage>
      </div>
    );
  }
  if (document.status === 'loading') {
    return (
      <div className={styles.reader} aria-busy="true">
        <p className={styles.loading}>otwieram książkę…</p>
      </div>
    );
  }
  return <ReaderView book={book} doc={document.doc} chapters={document.chapters} />;
}

type ReaderViewProps = {
  book: Book;
  doc: PDFDocumentProxy;
  chapters: Chapter[];
};

function ReaderView({ book, doc, chapters }: ReaderViewProps) {
  const pageCount = doc.numPages;
  const [page, setPage] = useState(() => Math.min(Math.max(1, book.page), pageCount));
  const [chrome, setChrome] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [selection, setSelection] = useState<Selection | null>(null);
  const { settings } = useSettings();
  const { saveBook } = useBooks();
  const breakpoint = useBreakpoint();
  const statuses = useWordStatuses(book.lang);
  const dueCount = useDueWords().length;
  const pageState = usePage(doc, book.id, page);
  const scrollRef = useRef<HTMLDivElement>(null);
  useReadingPosition(book, page);

  const desktop = breakpoint === 'desktop';
  const chapter = chapterAt(chapters, page);
  const showChrome = desktop || chrome || panelOpen;
  const bookmarked = book.bookmarks.includes(page);

  const goTo = useCallback(
    (next: number) => {
      const target = Math.min(Math.max(1, next), pageCount);
      setSelection(null);
      setPage(target);
      scrollRef.current?.scrollTo({ top: 0 });
    },
    [pageCount],
  );

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target instanceof HTMLElement ? event.target : null;
      if (target?.closest('input, textarea, [data-token], [role="dialog"]')) return;
      if (event.key === 'PageDown' || event.key === 'ArrowRight') goTo(page + 1);
      else if (event.key === 'PageUp' || event.key === 'ArrowLeft') goTo(page - 1);
      else if (event.key === 'Escape') setSelection(null);
      else return;
      event.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
    };
  }, [goTo, page]);

  const closePanel = useCallback(() => {
    setPanelOpen(false);
  }, []);

  const style = {
    '--reader-size': `${settings.fontSize}px`,
    '--reader-leading': settings.lineHeight,
    '--reader-side': `${MARGIN_SIDE[settings.margins]}px`,
    '--reader-measure': `${(desktop ? MEASURE_DESKTOP : MEASURE_TABLET)[settings.margins]}px`,
  } as CSSProperties;

  return (
    <div
      className={styles.reader}
      style={style}
      data-chrome={showChrome || undefined}
      data-hide-saved={settings.showSavedWords ? undefined : true}
    >
      {showChrome ? (
        <ReaderHeader
          title={book.title}
          lang={book.lang}
          position={positionLabel(chapter, page, pageCount)}
          panelOpen={panelOpen}
          bookmarked={bookmarked}
          onTogglePanel={() => {
            setSelection(null);
            setChrome(true);
            setPanelOpen(!panelOpen);
          }}
          onToggleBookmark={() => {
            const bookmarks = bookmarked
              ? book.bookmarks.filter((p) => p !== page)
              : [...book.bookmarks, page].sort((a, b) => a - b);
            saveBook({ ...book, page, bookmarks });
          }}
        />
      ) : (
        <div aria-hidden="true" className={styles.runningHead}>
          <span lang={book.lang}>{chapter?.title ?? book.title}</span>
        </div>
      )}

      <main id="main" ref={scrollRef} className={styles.scroller}>
        <h1 className="visually-hidden">
          {book.title}, strona {page}
        </h1>
        <div className={styles.page}>
          {pageState.status === 'loading' && <p className={styles.loading}>wczytuję stronę…</p>}
          {pageState.status === 'error' && (
            <p className={styles.empty}>Nie udało się odczytać tej strony.</p>
          )}
          {pageState.status === 'ready' && pageState.paragraphs.length === 0 && (
            <p className={styles.empty}>
              Na tej stronie nie ma tekstu do czytania — to pewnie ilustracja albo skan.
            </p>
          )}
          {pageState.status === 'ready' && pageState.paragraphs.length > 0 && (
            <ReaderPage
              paragraphs={pageState.paragraphs}
              lang={book.lang}
              statuses={statuses}
              selection={selection}
              handlers={{
                onWord: (target) => {
                  setPanelOpen(false);
                  setSelection({
                    paragraph: target.paragraph,
                    start: target.token,
                    end: target.token,
                  });
                },
                onEdge: (edge, target) => {
                  setSelection((current) =>
                    current?.paragraph === target.paragraph
                      ? moveEdge(current, edge, target.token)
                      : current,
                  );
                },
                onBackground: () => {
                  if (selection) setSelection(null);
                  else if (panelOpen) setPanelOpen(false);
                  else if (!desktop) setChrome(!chrome);
                },
                onSwipe: (direction) => {
                  goTo(page + direction);
                },
              }}
            />
          )}
          <PageNav page={page} pageCount={pageCount} onChange={goTo} />
        </div>
      </main>

      {!showChrome && !selection && (
        <ReaderFooter chapter={chapter?.number ?? null} page={page} pageCount={pageCount} />
      )}
      {panelOpen && <TypographyPanel onClose={closePanel} />}
      {showChrome && !desktop && !selection && <TabBar dueCount={dueCount} />}
    </div>
  );
}
