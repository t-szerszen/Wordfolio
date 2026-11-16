import { NavLink } from 'react-router';
import { Icon } from './Icon';
import type { GlyphName } from './glyphs';
import { Logo } from './Logo';
import styles from './TabBar.module.css';

type Tab = { to: string; label: string; glyph: GlyphName; end?: boolean };

const TABS: readonly Tab[] = [
  { to: '/', label: 'Półka', glyph: 'shelf', end: true },
  { to: '/czytaj', label: 'Czytaj', glyph: 'book' },
  { to: '/slownik', label: 'Słownik', glyph: 'cards' },
  { to: '/powtorki', label: 'Powtórki', glyph: 'review' },
  { to: '/ustawienia', label: 'Ustawienia', glyph: 'settings' },
];

type TabBarProps = {
  dueCount: number;
};

export function TabBar({ dueCount }: TabBarProps) {
  return (
    <nav aria-label="Główna nawigacja" className={styles.bar}>
      <svg
        aria-hidden="true"
        viewBox="0 0 400 6"
        preserveAspectRatio="none"
        className={styles.edge}
      >
        <path
          d="M0 3.4 C 40 2.2, 90 4.2, 140 3.1 S 230 2.4, 280 3.6 S 360 2.7, 400 3.2"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <NavLink to="/" className={styles.logo} aria-label="Wordfolio — półka">
        <Logo variant="mark" size={44} knock="var(--paper3)" />
      </NavLink>
      <ul className={styles.tabs}>
        {TABS.map((tab) => (
          <li key={tab.to} className={styles.item}>
            <NavLink to={tab.to} end={tab.end ?? false} className={styles.tab}>
              {({ isActive }) => (
                <>
                  <Icon name={tab.glyph} accent={isActive} />
                  <span className={styles.label}>{tab.label}</span>
                  {isActive && (
                    <svg aria-hidden="true" viewBox="0 0 40 6" className={styles.underline}>
                      <path d="M2 3.8 C 9 2.2, 16 4.6, 23 3.1 C 29 2, 34 3.4, 38 3" />
                    </svg>
                  )}
                  {tab.to === '/powtorki' && dueCount > 0 && (
                    <span className={styles.badge}>
                      {dueCount > 99 ? '99+' : dueCount}
                      <span className="visually-hidden"> do powtórki</span>
                    </span>
                  )}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
