import { Icon } from '../../components/Icon';
import { PenLoader } from '../../components/PenLoader';
import { PosTag } from '../../components/PosTag';
import { StatusMark } from '../../components/StatusMark';
import { SaveButton } from './SaveButton';
import type { SelectedWord } from './useSelectedWord';
import styles from './WordDetails.module.css';

type WordDetailsProps = {
  word: SelectedWord;
  lang: string;
  page: number;
  variant: 'sheet' | 'note';
  onClose: () => void;
};

export function WordDetails({ word, lang, page, variant, onClose }: WordDetailsProps) {
  const { translation, existing } = word;
  const result = translation.status === 'ready' ? translation.result : null;
  const saved = existing !== null;
  const hasTags = Boolean(result?.partOfSpeech) || saved;

  return (
    <div className={styles.details} data-variant={variant}>
      <div className={styles.head}>
        <div className={styles.headword}>
          <span lang={lang} className={styles.term}>
            {word.term}
          </span>
          {result?.ipa && <span className={styles.ipa}>{result.ipa}</span>}
        </div>
        <button
          type="button"
          className={styles.close}
          aria-label="Zamknij notatkę"
          onClick={onClose}
        >
          <Icon name="close" size={22} />
        </button>
      </div>

      {hasTags && (
        <div className={styles.tags}>
          {result?.partOfSpeech && <PosTag size="large">{result.partOfSpeech}</PosTag>}
          {existing && <StatusMark status={existing.status} />}
        </div>
      )}

      {translation.status === 'loading' && <PenLoader label="szukam w słowniku…" />}
      {translation.status === 'error' && (
        <div className={styles.error} role="alert">
          <p>{translation.message}</p>
          <button type="button" className={styles.retry} onClick={word.retry}>
            Spróbuj ponownie
          </button>
        </div>
      )}
      {result && (
        <>
          {result.translation && <span className={styles.translation}>{result.translation}</span>}
          {result.definition && <span className={styles.definition}>{result.definition}</span>}
        </>
      )}

      {variant === 'sheet' && (
        <div className={styles.context}>
          <span className={styles.source}>z książki · s. {page}</span>
          <span lang={lang} className={styles.sentence}>
            {word.context.before}
            <span className={styles.mark}>{word.context.match}</span>
            {word.context.after}
          </span>
        </div>
      )}

      <div className={styles.actions}>
        <SaveButton
          saved={saved}
          compact={variant === 'note'}
          disabled={saved && !word.canUnsave}
          onClick={saved ? word.unsave : word.save}
        />
        <button
          type="button"
          className={styles.card}
          aria-label="Otwórz kartę słówka"
          onClick={word.openCard}
        >
          <Icon name="pencil" size={22} />
        </button>
      </div>
      {word.phrase && (
        <span className={styles.hint}>przeciągnij uchwyty, by zmienić zaznaczenie</span>
      )}
    </div>
  );
}
