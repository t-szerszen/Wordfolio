import { useId } from 'react';
import { Icon } from '../../components/Icon';
import type { GlyphName } from '../../components/glyphs';
import { useSettings } from '../../hooks/useSettings';
import { LANGUAGES } from '../../lib/language/names';
import styles from './LanguageSettings.module.css';

type LanguageRowProps = {
  label: string;
  glyph: GlyphName;
  accent?: boolean;
  value: string;
  options: readonly { code: string; name: string }[];
  onChange: (value: string) => void;
};

function LanguageRow({ label, glyph, accent = false, value, options, onChange }: LanguageRowProps) {
  const id = useId();
  return (
    <div className={styles.row}>
      <Icon name={glyph} size={22} accent={accent} />
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <select
        id={id}
        className={styles.select}
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
        }}
      >
        {options.map((option) => (
          <option key={option.code} value={option.code}>
            {option.name}
          </option>
        ))}
      </select>
      <Icon name="chevron" size={20} />
    </div>
  );
}

export function LanguageSettings() {
  const { settings, updateSettings } = useSettings();
  return (
    <div className={styles.list}>
      <LanguageRow
        label="Język książek"
        glyph="book"
        value={settings.bookLang}
        options={[{ code: 'auto', name: 'wykrywaj automatycznie' }, ...LANGUAGES]}
        onChange={(bookLang) => {
          updateSettings({ bookLang });
        }}
      />
      <LanguageRow
        label="Tłumacz na"
        glyph="translate"
        accent
        value={settings.targetLang}
        options={LANGUAGES}
        onChange={(targetLang) => {
          updateSettings({ targetLang });
        }}
      />
    </div>
  );
}
