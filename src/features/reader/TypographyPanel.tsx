import { useEffect, useRef, type ReactNode } from 'react';
import { Icon } from '../../components/Icon';
import type { GlyphName } from '../../components/glyphs';
import { useSettings } from '../../hooks/useSettings';
import type { ThemeChoice } from '../../lib/data/models';
import { FONT_STEPS, LINE_HEIGHTS, MARGINS, MAX_FONT, MIN_FONT, stepFontSize } from './typography';
import styles from './TypographyPanel.module.css';

const THEMES: readonly { label: string; value: ThemeChoice; glyph: GlyphName }[] = [
  { label: 'Papier', value: 'papier', glyph: 'sun' },
  { label: 'Lampka', value: 'lampka', glyph: 'moon' },
  { label: 'System', value: 'system', glyph: 'sync' },
];

function Group({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className={styles.group} role="group" aria-label={label}>
      <span className={styles.label} aria-hidden="true">
        {label}
      </span>
      {children}
    </div>
  );
}

function LinesIcon({ d, frame }: { d: string; frame?: boolean }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" width={20} height={20} className={styles.lines}>
      {frame && <path className={styles.frame} d="M3.5 2.8 L 16.5 2.9 L 16.4 17.2 L 3.6 17.1 Z" />}
      <path d={d} />
    </svg>
  );
}

export function TypographyPanel({ onClose }: { onClose: () => void }) {
  const { settings, updateSettings } = useSettings();
  const ref = useRef<HTMLDivElement>(null);
  const sizeIndex = FONT_STEPS.findIndex((s) => s === settings.fontSize);

  useEffect(() => {
    ref.current?.querySelector<HTMLElement>('button')?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  return (
    <div
      ref={ref}
      id="typography-panel"
      role="dialog"
      aria-label="Typografia i motyw"
      className={styles.panel}
    >
      <Group label="rozmiar tekstu">
        <div className={styles.sizeRow}>
          <button
            type="button"
            className={styles.sizeButton}
            aria-label="Mniejszy tekst"
            disabled={settings.fontSize <= MIN_FONT}
            onClick={() => {
              updateSettings({ fontSize: stepFontSize(settings.fontSize, -1) });
            }}
          >
            A
          </button>
          <div className={styles.sizeValue}>
            <span aria-hidden="true" className={styles.ticks}>
              {FONT_STEPS.map((step, i) => (
                <span
                  key={step}
                  style={{ height: 6 + i * 1.6 }}
                  data-on={i === sizeIndex || undefined}
                />
              ))}
            </span>
            <span aria-live="polite">{settings.fontSize} px</span>
          </div>
          <button
            type="button"
            className={`${styles.sizeButton} ${styles.sizeLarge}`}
            aria-label="Większy tekst"
            disabled={settings.fontSize >= MAX_FONT}
            onClick={() => {
              updateSettings({ fontSize: stepFontSize(settings.fontSize, 1) });
            }}
          >
            A
          </button>
        </div>
      </Group>
      <Group label="interlinia">
        <div className={styles.options}>
          {LINE_HEIGHTS.map((option) => (
            <button
              key={option.value}
              type="button"
              className={styles.option}
              aria-pressed={Math.abs(settings.lineHeight - option.value) < 0.02}
              onClick={() => {
                updateSettings({ lineHeight: option.value });
              }}
            >
              <LinesIcon d={option.icon} />
              {option.label}
            </button>
          ))}
        </div>
      </Group>
      <Group label="marginesy">
        <div className={styles.options}>
          {MARGINS.map((option) => (
            <button
              key={option.value}
              type="button"
              className={styles.option}
              aria-pressed={settings.margins === option.value}
              onClick={() => {
                updateSettings({ margins: option.value });
              }}
            >
              <LinesIcon d={option.icon} frame />
              {option.label}
            </button>
          ))}
        </div>
      </Group>
      <Group label="motyw">
        <div className={styles.options}>
          {THEMES.map((option) => (
            <button
              key={option.value}
              type="button"
              className={styles.option}
              aria-pressed={settings.theme === option.value}
              onClick={() => {
                updateSettings({ theme: option.value });
              }}
            >
              <Icon name={option.glyph} size={20} accent={settings.theme === option.value} />
              {option.label}
            </button>
          ))}
        </div>
        <span className={styles.note}>wybór zapamiętamy na wszystkich Twoich urządzeniach</span>
      </Group>
    </div>
  );
}
