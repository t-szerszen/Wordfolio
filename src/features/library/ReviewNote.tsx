import { Link } from 'react-router';
import { Icon } from '../../components/Icon';
import { countLabel } from '../../lib/plural';
import styles from './ReviewNote.module.css';

const SECONDS_PER_CARD = 12;

export function ReviewNote({ dueCount, wordCount }: { dueCount: number; wordCount: number }) {
  if (dueCount === 0) {
    return (
      <div className={styles.note}>
        <span aria-hidden="true" className={styles.tape} />
        <span className={styles.headline}>
          {wordCount === 0 ? 'Tu pojawią się słówka' : 'Na dziś wszystko'}
        </span>
        <span className={styles.meta}>
          {wordCount === 0 ? 'stuknij słowo w książce' : 'kolejne powtórki jutro'}
        </span>
      </div>
    );
  }
  const minutes = Math.max(1, Math.round((dueCount * SECONDS_PER_CARD) / 60));
  return (
    <Link to="/powtorki" className={styles.note}>
      <span aria-hidden="true" className={styles.tape} />
      <span className={styles.headline}>
        {countLabel(dueCount, 'słówko', 'słówka', 'słówek')} do powtórki
      </span>
      <span className={styles.meta}>ok. {countLabel(minutes, 'minuta', 'minuty', 'minut')}</span>
      <span className={styles.start}>
        Zacznij
        <Icon name="next" size={20} />
      </span>
    </Link>
  );
}
