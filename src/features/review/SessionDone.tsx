import { Link } from 'react-router';
import { Icon } from '../../components/Icon';
import { countLabel } from '../../lib/plural';
import type { Streak } from '../../lib/streak';
import { GRADES } from './grades';
import type { Forecast, Session } from './session';
import styles from './SessionDone.module.css';

type SessionDoneProps = {
  session: Session | null;
  forecast: Forecast;
  streak: Streak;
  canStudyMore: boolean;
  onMore: () => void;
};

function summary(session: Session | null, forecast: Forecast): string {
  const reviewed =
    session && session.done > 0
      ? `${countLabel(session.done, 'karta powtórzona', 'karty powtórzone', 'kart powtórzonych')}. `
      : '';
  if (forecast.tomorrow === 0) return `${reviewed}Jutro nic nie czeka.`;
  const fromToday =
    forecast.fromToday > 0 ? ` — w tym ${forecast.fromToday} z dzisiejszego czytania` : '';
  return `${reviewed}Jutro czeka ${forecast.tomorrow}${fromToday}.`;
}

export function SessionDone({ session, forecast, streak, canStudyMore, onMore }: SessionDoneProps) {
  return (
    <div className={styles.done}>
      <svg
        role="img"
        aria-label="Rysunek filiżanki herbaty"
        viewBox="0 0 120 110"
        className={styles.cup}
      >
        <g className={styles.ink}>
          <path d="M23 47 C 23 42.5, 85 42, 86 46.6 C 86.6 51, 23.6 51.6, 23 47 Z" />
          <path d="M23 47.5 C 23.6 70, 35 86.4, 54.6 86.2 C 74 86, 85.6 70, 86 47.2" />
          <path d="M85.4 55 C 97 52.6, 102 60, 98 67.6 C 95 73.4, 88.6 75.6, 82 74" />
          <path d="M9.6 91.6 C 30 100.4, 80 100.6, 101 91.2" />
          <path d="M33 94.6 C 46 97.6, 64 97.6, 77 94.4" />
          <path d="M66 48.6 C 70 54, 72.6 58, 74.6 63" />
        </g>
        <path className={styles.label} d="M70.6 62.2 L 80.2 60.6 L 82.4 73.6 L 72.8 75.2 Z" />
        <g className={styles.steam}>
          <path pathLength={60} d="M44 36 C 37.6 28, 50.4 23, 44.4 12.4" />
          <path pathLength={60} d="M58.4 35 C 52.4 27.4, 64.6 22, 58.6 10.6" />
        </g>
      </svg>
      <h2 className={styles.title}>Na dziś wszystko.</h2>
      <p className={styles.text}>{summary(session, forecast)}</p>
      {session && session.done > 0 && (
        <ul className={styles.tally}>
          {GRADES.filter(({ grade }) => session.tally[grade] > 0).map(({ grade, label, color }) => (
            <li key={grade}>
              <svg
                aria-hidden="true"
                width={18}
                height={6}
                viewBox="0 0 18 6"
                style={{ stroke: color }}
              >
                <path d="M1 3.2 C 6 2.4, 12 3.8, 17 2.8" />
              </svg>
              {label} {session.tally[grade]}
            </li>
          ))}
        </ul>
      )}
      {streak.count > 0 && (
        <div className={styles.streak}>
          <Icon name="streak" size={22} accent />
          <span>{countLabel(streak.count, 'dzień', 'dni', 'dni')} z rzędu</span>
        </div>
      )}
      <div className={styles.actions}>
        <Link to="/czytaj" className={styles.primary}>
          <Icon name="book" size={22} />
          Wróć do czytania
        </Link>
        {canStudyMore && (
          <button type="button" className={styles.more} onClick={onMore}>
            Jeszcze 5 kart
          </button>
        )}
      </div>
    </div>
  );
}
