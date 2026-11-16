import { Icon } from '../../components/Icon';
import { countLabel } from '../../lib/plural';
import type { Streak } from '../../lib/streak';
import { tallyPaths, tallyWidth } from './tally';
import styles from './StreakCard.module.css';

const MAX_MARKS = 20;

export function StreakCard({ streak }: { streak: Streak }) {
  const marks = Math.min(streak.count, MAX_MARKS);
  const paths = tallyPaths(marks);
  const width = tallyWidth(marks);
  return (
    <div className={styles.card}>
      <div className={styles.head}>
        <Icon name="streak" size={22} accent />
        <span className={styles.count}>
          {streak.count > 0
            ? `${countLabel(streak.count, 'dzień', 'dni', 'dni')} z rzędu`
            : 'Zacznij serię'}
        </span>
      </div>
      {marks > 0 && (
        <svg
          role="img"
          aria-label={countLabel(streak.count, 'kreska', 'kreski', 'kresek')}
          viewBox={`0 0 ${width} 34`}
          width={width}
          height={34}
          className={styles.tally}
        >
          {paths.map((d, i) => (
            <path
              key={d}
              d={d}
              className={streak.doneToday && i === paths.length - 1 ? styles.today : undefined}
            />
          ))}
        </svg>
      )}
      <span className={styles.meta}>
        {streak.doneToday
          ? 'dziś już jest kreska'
          : streak.count > 0
            ? 'dziś jeszcze bez kreski'
            : 'kreska za każdy dzień z powtórką'}
      </span>
    </div>
  );
}
