import { useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router';
import { Button } from '../../components/Button';
import { Dialog } from '../../components/Dialog';
import { Icon } from '../../components/Icon';
import { PosTag } from '../../components/PosTag';
import { Screen } from '../../components/Screen';
import { SentenceQuote } from '../../components/SentenceQuote';
import { StatusSwatch } from '../../components/StatusMark';
import { useBooks } from '../../hooks/useBooks';
import { useNow } from '../../hooks/useNow';
import { useWords } from '../../hooks/useWords';
import type { Word, WordStatus } from '../../lib/data/models';
import { addedLabel, dueLabel } from '../../lib/dates';
import { applyStatus } from '../../lib/srs/scheduler';
import { BookCover } from '../library/BookCover';
import { TagEditor } from './TagEditor';
import { useWordDraft } from './useWordDraft';
import styles from './WordCardScreen.module.css';

const STATUSES: readonly { value: WordStatus; label: string }[] = [
  { value: 'new', label: 'Nowe' },
  { value: 'learning', label: 'W nauce' },
  { value: 'known', label: 'Znane' },
];

export function WordCardScreen() {
  const { wordId = '' } = useParams();
  const { words, loading } = useWords();
  if (loading) return null;
  const word = words.find((w) => w.id === wordId);
  if (!word) return <Navigate to="/slownik" replace />;
  return <WordCard key={word.id} word={word} />;
}

function WordCard({ word }: { word: Word }) {
  const { draft, update, flush, discard } = useWordDraft(word);
  const { removeWord } = useWords();
  const { books } = useBooks();
  const navigate = useNavigate();
  const now = useNow();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const book = books.find((b) => b.id === draft.context.bookId);

  const done = () => {
    flush();
    void navigate('/slownik');
  };
  const doneButton = (
    <Button icon="check" onClick={done}>
      Gotowe
    </Button>
  );

  return (
    <Screen width="medium" footer={<div className={styles.bottomBar}>{doneButton}</div>}>
      <header className={styles.header}>
        <Link
          to="/slownik"
          className={styles.iconButton}
          aria-label="Wróć do słownika"
          onClick={flush}
        >
          <Icon name="prev" />
        </Link>
        <h1 className={styles.heading}>Karta słówka</h1>
        <button
          type="button"
          className={styles.iconButton}
          aria-label="Usuń kartę"
          onClick={() => {
            setConfirmDelete(true);
          }}
        >
          <Icon name="trash" />
        </button>
        <div className={styles.topDone}>
          <Button icon="check" size="medium" onClick={done}>
            Gotowe
          </Button>
        </div>
      </header>

      <div className={styles.columns}>
        <div className={styles.left}>
          {draft.context.bookId && (
            <Link
              to={book ? `/czytaj/${book.id}?strona=${draft.context.page ?? book.page}` : '/'}
              className={styles.bookChip}
            >
              {book && <BookCover book={book} variant="mini" width={26} height={38} />}
              <span className={styles.bookText}>
                <span lang={draft.lang} className={styles.bookTitle}>
                  {draft.context.bookTitle}
                </span>
                <span className={styles.bookMeta}>
                  {draft.context.page !== null && `s. ${draft.context.page} · `}
                  {addedLabel(draft.createdAt, now)}
                </span>
              </span>
            </Link>
          )}

          <div className={styles.headword}>
            <div className={styles.termRow}>
              <span lang={draft.lang} className={styles.term}>
                {draft.term}
              </span>
              {draft.ipa && <span className={styles.ipa}>{draft.ipa}</span>}
            </div>
            {draft.pos && <PosTag size="large">{draft.pos}</PosTag>}
          </div>

          <div role="radiogroup" aria-label="Status słówka" className={styles.segments}>
            {STATUSES.map((option) => (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={draft.status === option.value}
                className={styles.segment}
                onClick={() => {
                  update({
                    status: option.value,
                    srs: applyStatus(draft.srs, option.value, Date.now()),
                  });
                }}
              >
                {option.label}
                <StatusSwatch status={option.value} />
              </button>
            ))}
          </div>

          <div className={styles.fields}>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>Tłumaczenie</span>
              <input
                className={styles.translation}
                value={draft.translation}
                maxLength={300}
                onChange={(event) => {
                  update({ translation: event.target.value });
                }}
              />
            </label>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>Definicja</span>
              <textarea
                className={styles.definition}
                rows={2}
                value={draft.definition}
                maxLength={600}
                onChange={(event) => {
                  update({ definition: event.target.value });
                }}
              />
            </label>
          </div>

          <TagEditor
            tags={draft.tags}
            onChange={(tags) => {
              update({ tags });
            }}
          />
        </div>

        <div className={styles.right}>
          <label className={styles.sticky}>
            <span aria-hidden="true" className={styles.tape} />
            <span className={styles.fieldLabel}>Twoja notatka</span>
            <textarea
              className={styles.note}
              rows={3}
              value={draft.note}
              maxLength={1000}
              onChange={(event) => {
                update({ note: event.target.value });
              }}
            />
          </label>

          {draft.context.sentence && (
            <div className={styles.example}>
              <span className={styles.exampleLabel}>przykład z książki</span>
              <SentenceQuote
                sentence={draft.context.sentence}
                term={draft.term}
                lang={draft.lang}
                className={styles.exampleText}
              />
            </div>
          )}

          <div className={styles.next}>
            <Icon name="review" size={22} accent />
            <span>następna powtórka: {dueLabel(draft.srs.due, now)}</span>
          </div>
        </div>
      </div>

      <Dialog
        open={confirmDelete}
        title={`Usunąć „${draft.term}”?`}
        onClose={() => {
          setConfirmDelete(false);
        }}
      >
        <p className={styles.dialogText}>
          Słówko zniknie ze słownika i z powtórek na wszystkich Twoich urządzeniach. Tego nie da się
          cofnąć.
        </p>
        <Button
          icon="trash"
          onClick={() => {
            discard();
            removeWord(word.id);
            void navigate('/slownik', { replace: true });
          }}
        >
          Usuń słówko
        </Button>
        <Button
          variant="link"
          onClick={() => {
            setConfirmDelete(false);
          }}
        >
          Anuluj
        </Button>
      </Dialog>
    </Screen>
  );
}
