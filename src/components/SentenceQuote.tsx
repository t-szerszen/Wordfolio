import styles from './SentenceQuote.module.css';

type SentenceQuoteProps = {
  sentence: string;
  term: string;
  lang: string;
  /** „mark” — zakreślenie markerem, „bold” — samo pogrubienie (tył fiszki). */
  emphasis?: 'mark' | 'bold';
  className?: string;
};

/** Zdanie z książki z wyróżnionym słowem. Szuka słowa bez względu na wielkość liter. */
export function SentenceQuote({
  sentence,
  term,
  lang,
  emphasis = 'mark',
  className,
}: SentenceQuoteProps) {
  const index = sentence.toLocaleLowerCase(lang).indexOf(term.toLocaleLowerCase(lang));
  const classes = [styles.quote, className].filter(Boolean).join(' ');
  if (index < 0 || term === '') {
    return (
      <span lang={lang} className={classes}>
        {sentence}
      </span>
    );
  }
  return (
    <span lang={lang} className={classes}>
      {sentence.slice(0, index)}
      <span className={emphasis === 'mark' ? styles.mark : styles.bold}>
        {sentence.slice(index, index + term.length)}
      </span>
      {sentence.slice(index + term.length)}
    </span>
  );
}
