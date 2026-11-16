import { PosTag } from '../../components/PosTag';
import { SentenceQuote } from '../../components/SentenceQuote';
import type { Word } from '../../lib/data/models';
import styles from './Flashcard.module.css';

type FlashcardProps = {
  word: Word;
  flipped: boolean;
  onFlip: () => void;
};

function source(word: Word): string {
  const { bookTitle, page } = word.context;
  const parts = [bookTitle, page !== null ? `s. ${page}` : ''].filter(Boolean);
  return parts.length > 0 ? `z książki · ${parts.join(', ')}` : 'ze słownika';
}

export function Flashcard({ word, flipped, onFlip }: FlashcardProps) {
  const sentence = word.context.sentence;
  return (
    <div className={styles.stage}>
      <div className={styles.card} data-flipped={flipped || undefined}>
        <button
          type="button"
          className={`${styles.face} ${styles.front}`}
          aria-hidden={flipped}
          tabIndex={flipped ? -1 : 0}
          onClick={onFlip}
        >
          <span className={styles.source}>{source(word)}</span>
          <span className={styles.sentence}>
            {sentence ? (
              <SentenceQuote
                sentence={sentence}
                term={word.term}
                lang={word.lang}
                className={styles.sentenceText}
              />
            ) : (
              <span lang={word.lang} className={styles.lonely}>
                {word.term}
              </span>
            )}
          </span>
          <span className={styles.hint}>stuknij, by odwrócić</span>
        </button>
        <button
          type="button"
          className={`${styles.face} ${styles.back}`}
          aria-hidden={!flipped}
          tabIndex={flipped ? 0 : -1}
          onClick={onFlip}
        >
          <span className={styles.headword}>
            <span lang={word.lang} className={styles.term}>
              {word.term}
            </span>
            {word.ipa && <span className={styles.ipa}>{word.ipa}</span>}
          </span>
          {word.pos && <PosTag>{word.pos}</PosTag>}
          <span className={styles.translation}>
            {word.translation || 'bez tłumaczenia — uzupełnij na karcie'}
          </span>
          {word.note && <span className={styles.note}>{word.note}</span>}
          {word.definition && <span className={styles.definition}>{word.definition}</span>}
          {sentence && (
            <SentenceQuote
              sentence={sentence}
              term={word.term}
              lang={word.lang}
              emphasis="bold"
              className={styles.backSentence}
            />
          )}
        </button>
      </div>
    </div>
  );
}
