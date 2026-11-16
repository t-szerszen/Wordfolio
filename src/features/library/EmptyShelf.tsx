import { Button } from '../../components/Button';
import { Icon } from '../../components/Icon';
import type { GlyphName } from '../../components/glyphs';
import styles from './EmptyShelf.module.css';

const STEPS: readonly { label: string; glyph: GlyphName; rotate: number }[] = [
  { label: 'wgraj PDF', glyph: 'upload', rotate: -1.2 },
  { label: 'stuknij słowo', glyph: 'tap', rotate: 0.8 },
  { label: 'powtarzaj', glyph: 'review', rotate: -0.5 },
];

export function EmptyShelf({ onAdd, busy }: { onAdd: () => void; busy: boolean }) {
  return (
    <div className={styles.empty}>
      <div aria-hidden="true" className={styles.picture}>
        <svg viewBox="0 0 350 190" preserveAspectRatio="xMidYMax meet" className={styles.drawing}>
          <g className={styles.ink}>
            <path d="M104 160 L 103 104 C 103 100, 105 98, 109 98 L 112 98" />
            <path d="M104 160 L 132 159.6" />
            <path d="M240 160 C 238 140, 244 122, 262 112 C 266 110, 270 112, 268 118 C 262 132, 262 146, 266 160" />
            <path d="M256 124 C 251 120, 246 121, 244 126 M262 116 C 266 108, 272 104, 278 106" />
          </g>
          <path className={styles.outline} d="M150 160 L 150 52 L 182 52 L 182 160" />
          <path className={styles.ribbon} d="M166 40 C 166 46, 165.6 50, 166.2 54" />
        </svg>
        <div className={styles.plank} />
      </div>
      <div className={styles.text}>
        <h1 className={styles.title}>Pusta półka czeka</h1>
        <p className={styles.lead}>
          Dodaj pierwszą książkę w PDF — w dowolnym języku. Stuknij nieznane słowo, a Wordfolio
          pokaże tłumaczenie razem ze zdaniem z książki i odłoży je do Twojego słownika.
        </p>
      </div>
      <Button icon="upload" onClick={onAdd} disabled={busy}>
        Dodaj książkę
      </Button>
      <span className={styles.hint}>najlepiej PDF z tekstem, nie skan</span>
      <ol className={styles.steps}>
        {STEPS.map((step) => (
          <li
            key={step.label}
            className={styles.step}
            style={{ transform: `rotate(${step.rotate}deg)` }}
          >
            <Icon name={step.glyph} accent />
            <span className={styles.stepLabel}>{step.label}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
