import { useId } from 'react';
import { useSettings } from '../../hooks/useSettings';
import { LINE_HEIGHTS, MAX_FONT, MIN_FONT } from '../reader/typography';
import styles from './ReadingSettings.module.css';

const TRACK = 'M2 5.4 C 50 3.6, 100 6.6, 150 4.8 S 250 3.8, 298 5.6';

export function ReadingSettings() {
  const { settings, updateSettings } = useSettings();
  const sizeId = useId();
  const percent = Math.round(((settings.fontSize - MIN_FONT) / (MAX_FONT - MIN_FONT)) * 100);

  return (
    <>
      <div className={styles.block}>
        <div className={styles.row}>
          <label htmlFor={sizeId}>Domyślny rozmiar tekstu</label>
          <span className={styles.value}>{settings.fontSize} px</span>
        </div>
        <div className={styles.slider}>
          <span aria-hidden="true" className={styles.small}>
            A
          </span>
          <div className={styles.track}>
            <svg
              aria-hidden="true"
              viewBox="0 0 300 10"
              preserveAspectRatio="none"
              className={styles.line}
            >
              <path className={styles.base} d={TRACK} vectorEffect="non-scaling-stroke" />
              <path
                className={styles.fill}
                d={TRACK}
                style={{ clipPath: `inset(-5px ${100 - percent}% -5px 0)` }}
                vectorEffect="non-scaling-stroke"
              />
            </svg>
            <span
              aria-hidden="true"
              className={styles.knob}
              style={{ left: `calc(${percent}% - 11px)` }}
            />
            <input
              id={sizeId}
              type="range"
              min={MIN_FONT}
              max={MAX_FONT}
              step={1}
              value={settings.fontSize}
              className={styles.input}
              onChange={(event) => {
                updateSettings({ fontSize: Number(event.target.value) });
              }}
            />
          </div>
          <span aria-hidden="true" className={styles.large}>
            A
          </span>
        </div>
        <p
          lang="en"
          className={styles.preview}
          style={{ fontSize: settings.fontSize, lineHeight: settings.lineHeight }}
        >
          Alice was beginning to get very tired of sitting by her sister on the bank.
        </p>
      </div>

      <div className={styles.block}>
        <span id="line-height-label">Interlinia</span>
        <div role="radiogroup" aria-labelledby="line-height-label" className={styles.segments}>
          {LINE_HEIGHTS.map((option) => (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={Math.abs(settings.lineHeight - option.value) < 0.02}
              className={styles.segment}
              onClick={() => {
                updateSettings({ lineHeight: option.value });
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.toggleRow}>
        <span id="show-saved-label">Pokazuj zapisane słowa w tekście</span>
        <button
          type="button"
          role="switch"
          aria-checked={settings.showSavedWords}
          aria-labelledby="show-saved-label"
          className={styles.switch}
          onClick={() => {
            updateSettings({ showSavedWords: !settings.showSavedWords });
          }}
        >
          <span aria-hidden="true" className={styles.thumb} />
        </button>
      </div>
    </>
  );
}
