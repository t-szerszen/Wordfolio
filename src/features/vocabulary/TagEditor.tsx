import { useState } from 'react';
import { Icon } from '../../components/Icon';
import styles from './TagEditor.module.css';

const COLORS = ['var(--st-rose)', 'var(--st-sage)', 'var(--st-ochre)'];
const TILT = [-1, 0.8, -0.4];
const MAX_TAGS = 20;

type TagEditorProps = {
  tags: readonly string[];
  onChange: (tags: string[]) => void;
};

export function TagEditor({ tags, onChange }: TagEditorProps) {
  const [adding, setAdding] = useState(false);
  const [value, setValue] = useState('');

  const commit = () => {
    const tag = value.trim().slice(0, 40);
    if (tag && !tags.includes(tag) && tags.length < MAX_TAGS) onChange([...tags, tag]);
    setValue('');
    setAdding(false);
  };

  return (
    <div className={styles.editor} role="group" aria-labelledby="tags-label">
      <span id="tags-label" className={styles.label}>
        Etykiety
      </span>
      <div className={styles.list}>
        {tags.map((tag, i) => (
          <span
            key={tag}
            className={styles.tag}
            style={{
              background: COLORS[i % COLORS.length],
              transform: `rotate(${TILT[i % TILT.length]}deg)`,
            }}
          >
            {tag}
            <button
              type="button"
              className={styles.remove}
              aria-label={`Usuń etykietę ${tag}`}
              onClick={() => {
                onChange(tags.filter((t) => t !== tag));
              }}
            >
              <Icon name="close" size={14} />
            </button>
          </span>
        ))}
        {adding ? (
          <input
            className={styles.input}
            aria-label="Nowa etykieta"
            value={value}
            maxLength={40}
            // eslint-disable-next-line jsx-a11y/no-autofocus -- pole pojawia się po kliknięciu „dodaj”
            autoFocus
            onChange={(event) => {
              setValue(event.target.value);
            }}
            onBlur={commit}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                commit();
              } else if (event.key === 'Escape') {
                setValue('');
                setAdding(false);
              }
            }}
          />
        ) : (
          tags.length < MAX_TAGS && (
            <button
              type="button"
              className={styles.add}
              onClick={() => {
                setAdding(true);
              }}
            >
              <Icon name="plus" size={16} />
              dodaj
            </button>
          )
        )}
      </div>
    </div>
  );
}
