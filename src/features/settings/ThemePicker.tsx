import { Icon } from '../../components/Icon';
import { useRadioGroup } from '../../hooks/useRadioGroup';
import { useSettings } from '../../hooks/useSettings';
import type { ThemeChoice } from '../../lib/data/models';
import styles from './ThemePicker.module.css';

const OPTIONS: readonly { value: ThemeChoice; label: string }[] = [
  { value: 'papier', label: 'Papier' },
  { value: 'lampka', label: 'Lampka' },
  { value: 'system', label: 'Jak system' },
];

export function ThemePicker() {
  const { settings, updateSettings } = useSettings();
  const radio = useRadioGroup(
    OPTIONS.map((o) => o.value),
    settings.theme,
    (theme) => {
      updateSettings({ theme });
    },
  );
  return (
    <>
      <div role="radiogroup" aria-label="Motyw" className={styles.options}>
        {OPTIONS.map((option) => {
          const checked = settings.theme === option.value;
          return (
            <button
              key={option.value}
              type="button"
              className={styles.option}
              {...radio(option.value)}
            >
              <span aria-hidden="true" className={styles.preview} data-theme-preview={option.value}>
                <span className={styles.line} style={{ right: 18, top: 16, opacity: 0.75 }} />
                <span className={styles.line} style={{ right: 28, top: 28 }} />
                <span className={styles.line} style={{ right: 22, top: 40 }} />
                <span className={styles.accent} />
                {checked && (
                  <span className={styles.check}>
                    <Icon name="check" size={16} strokeWidth={2.2} />
                  </span>
                )}
              </span>
              <span className={styles.label}>{option.label}</span>
            </button>
          );
        })}
      </div>
      <span className={styles.note}>wybór zapamiętamy na wszystkich Twoich urządzeniach</span>
    </>
  );
}
