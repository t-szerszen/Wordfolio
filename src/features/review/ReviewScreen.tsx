import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Icon } from '../../components/Icon';
import { Screen } from '../../components/Screen';
import { useNow } from '../../hooks/useNow';
import { useSettings } from '../../hooks/useSettings';
import { useWords } from '../../hooks/useWords';
import { previewIntervals } from '../../lib/srs/scheduler';
import type { Grade } from '../../lib/srs/types';
import { computeStreak, dayKey } from '../../lib/streak';
import { Flashcard } from './Flashcard';
import { GradeButtons } from './GradeButtons';
import { GRADES } from './grades';
import { answer, forecast, startExtraSession, startSession, type Session } from './session';
import { SessionDone } from './SessionDone';
import { SessionProgress } from './SessionProgress';
import styles from './ReviewScreen.module.css';

export function ReviewScreen() {
  const { words, loading, saveWord } = useWords();
  const { settings, addReviewDay } = useSettings();
  const now = useNow();
  const [started, setStarted] = useState<Session | null>(null);
  const [flipped, setFlipped] = useState(false);

  // Sesja „zamraża” kolejkę dopiero przy pierwszej odpowiedzi; wcześniej wynika z bieżących słówek.
  const session = started ?? (loading ? null : startSession(words, now));
  const queue = session?.queue.filter((id) => words.some((w) => w.id === id)) ?? [];
  const current = words.find((w) => w.id === queue[0]) ?? null;
  const today = dayKey(new Date(now));
  const streak = computeStreak(settings.reviewDays, today);

  const grade = (value: Grade) => {
    if (!session || !current) return;
    const result = answer({ ...session, queue }, current, value, Date.now());
    saveWord(result.word);
    setStarted(result.session);
    setFlipped(false);
    if (!settings.reviewDays.includes(today)) addReviewDay(today);
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (
        !current ||
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }
      const index = Number(event.key) - 1;
      const option = GRADES[index];
      if (flipped && option) {
        event.preventDefault();
        grade(option.grade);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
    };
  });

  const total = session?.total ?? 0;
  const done = session?.done ?? 0;
  const position = current ? Math.min(total, done + 1) : total;

  return (
    <Screen width="narrow">
      <header className={styles.header}>
        <Link to="/" className={styles.close} aria-label="Zakończ powtórki">
          <Icon name="close" />
        </Link>
        <h1 className={styles.title}>Powtórki</h1>
        {total > 0 && (
          <span className={styles.counter}>
            {position} z {total}
          </span>
        )}
      </header>
      <SessionProgress done={done} total={total} />

      {!loading && current && (
        <div className={styles.session}>
          <Flashcard
            key={current.id}
            word={current}
            flipped={flipped}
            onFlip={() => {
              setFlipped(!flipped);
            }}
          />
          {flipped ? (
            <GradeButtons intervals={previewIntervals(current.srs, now)} onGrade={grade} />
          ) : (
            <button
              type="button"
              className={styles.reveal}
              onClick={() => {
                setFlipped(true);
              }}
            >
              <Icon name="review" size={22} accent />
              Pokaż odpowiedź
            </button>
          )}
        </div>
      )}

      {!loading && !current && words.length === 0 && (
        <div className={styles.empty}>
          <p>Tu pojawią się słówka do powtórki.</p>
          <p className={styles.emptyHint}>stuknij słowo w książce i zapisz je do słownika</p>
        </div>
      )}

      {!loading && !current && words.length > 0 && (
        <SessionDone
          session={started}
          forecast={forecast(words, now)}
          streak={streak}
          canStudyMore={startExtraSession(words, now).queue.length > 0}
          onMore={() => {
            setStarted(startExtraSession(words, Date.now()));
            setFlipped(false);
          }}
        />
      )}
    </Screen>
  );
}
