import { useMemo, useState } from 'react';
import { Icon } from '../../components/Icon';
import { Screen } from '../../components/Screen';
import { StatusSwatch } from '../../components/StatusMark';
import { useBooks } from '../../hooks/useBooks';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { useWords } from '../../hooks/useWords';
import type { Word, WordStatus } from '../../lib/data/models';
import { countLabel } from '../../lib/plural';
import { filterWords, topTags, type WordFilter, type WordSort } from './filterWords';
import { WordTile } from './WordTile';
import styles from './VocabularyScreen.module.css';

const COLUMNS = { phone: 2, tablet: 3, desktop: 4 } as const;
const STATUS_CHIPS: readonly { value: WordStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Wszystkie' },
  { value: 'new', label: 'Nowe' },
  { value: 'learning', label: 'W nauce' },
  { value: 'known', label: 'Znane' },
];
const TAG_COLORS = ['var(--st-ochre)', 'var(--st-sage)', 'var(--st-rose)'];

function columns(words: readonly Word[], count: number): Word[][] {
  const result: Word[][] = Array.from({ length: count }, () => []);
  words.forEach((word, i) => result[i % count]?.push(word));
  return result;
}

export function VocabularyScreen() {
  const { words, loading } = useWords();
  const { books } = useBooks();
  const breakpoint = useBreakpoint();
  const [filter, setFilter] = useState<WordFilter>({
    query: '',
    status: 'all',
    bookId: null,
    tags: [],
  });
  const [sort, setSort] = useState<WordSort>('recent');

  const visible = useMemo(() => filterWords(words, filter, sort), [words, filter, sort]);
  const tags = useMemo(() => topTags(words, 6), [words]);
  const bookOptions = useMemo(
    () => books.filter((b) => words.some((w) => w.context.bookId === b.id)),
    [books, words],
  );
  const update = (patch: Partial<WordFilter>) => {
    setFilter((current) => ({ ...current, ...patch }));
  };

  return (
    <Screen>
      <header className={styles.header}>
        <div className={styles.titles}>
          <h1 className={styles.title}>Słownik</h1>
          <span className={styles.count}>
            {countLabel(words.length, 'słówko', 'słówka', 'słówek')}
          </span>
        </div>
        <button
          type="button"
          className={styles.sort}
          aria-label={`Sortuj: ${sort === 'az' ? 'A–Z' : 'Ostatnie'} (zmień na ${sort === 'az' ? 'ostatnio dodane' : 'alfabetyczne'})`}
          onClick={() => {
            setSort(sort === 'az' ? 'recent' : 'az');
          }}
        >
          <Icon name="sort" size={20} accent />
          {sort === 'az' ? 'A–Z' : 'Ostatnie'}
        </button>
      </header>

      <div className={styles.search}>
        <Icon name="search" size={22} />
        <label htmlFor="vocabulary-search" className="visually-hidden">
          Szukaj w słowniku
        </label>
        <input
          id="vocabulary-search"
          type="search"
          className={styles.searchInput}
          placeholder="Szukaj słowa lub tłumaczenia"
          value={filter.query}
          onChange={(event) => {
            update({ query: event.target.value });
          }}
        />
      </div>

      <div className={styles.chips} role="group" aria-label="Status słówek">
        {STATUS_CHIPS.map((chip) => (
          <button
            key={chip.value}
            type="button"
            className={styles.chip}
            aria-pressed={filter.status === chip.value}
            onClick={() => {
              update({ status: chip.value });
            }}
          >
            {chip.label}
            {chip.value !== 'all' && <StatusSwatch status={chip.value} />}
          </button>
        ))}
      </div>

      {(bookOptions.length > 1 || tags.length > 0) && (
        <div className={styles.filters}>
          {bookOptions.length > 1 && (
            <div className={styles.bookSelect}>
              <Icon name="book" size={18} />
              <label htmlFor="vocabulary-book" className="visually-hidden">
                Książka
              </label>
              <select
                id="vocabulary-book"
                value={filter.bookId ?? ''}
                onChange={(event) => {
                  update({ bookId: event.target.value || null });
                }}
              >
                <option value="">Wszystkie książki</option>
                {bookOptions.map((book) => (
                  <option key={book.id} value={book.id}>
                    {book.title}
                  </option>
                ))}
              </select>
              <Icon name="chevron" size={18} />
            </div>
          )}
          {tags.map((tag, i) => (
            <button
              key={tag}
              type="button"
              className={styles.tag}
              style={{ background: TAG_COLORS[i % TAG_COLORS.length] }}
              aria-pressed={filter.tags.includes(tag)}
              onClick={() => {
                update({
                  tags: filter.tags.includes(tag)
                    ? filter.tags.filter((t) => t !== tag)
                    : [...filter.tags, tag],
                });
              }}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {!loading && visible.length === 0 ? (
        <p className={styles.empty}>
          {words.length === 0
            ? 'Tu jeszcze pusto — stuknij słowo w książce.'
            : 'Nic nie pasuje do tych filtrów.'}
        </p>
      ) : (
        <div className={styles.columns}>
          {columns(visible, COLUMNS[breakpoint]).map((column, i) => (
            <ul key={i} className={styles.column}>
              {column.map((word) => (
                <li key={word.id}>
                  <WordTile word={word} />
                </li>
              ))}
            </ul>
          ))}
        </div>
      )}
    </Screen>
  );
}
