import { useRef, useState, type ReactNode } from 'react';
import type { Word } from '../../lib/data/models';
import type { Paragraph } from '../../lib/pdf/layout';
import { normalizeTerm, type Token } from '../../lib/text/tokenize';
import { MarginNotes } from './MarginNotes';
import { ReaderParagraph } from './ReaderParagraph';
import type { Selection } from './selection';
import { useReaderInteractions, type ReaderHandlers, type TokenRef } from './useReaderInteractions';
import styles from './ReaderPage.module.css';

type ReaderPageProps = {
  paragraphs: readonly Paragraph[];
  tokens: readonly (readonly Token[])[];
  lang: string;
  words: ReadonlyMap<string, Word>;
  selection: Selection | null;
  /** Szerszy ekran: notatki i karta słowa na marginesie obok akapitu. */
  wide: boolean;
  activeNote: ReactNode;
  handlers: Omit<ReaderHandlers, 'onFocusToken' | 'onExtend'>;
};

function firstWordOf(tokens: readonly (readonly Token[])[]): TokenRef | null {
  for (const [paragraph, list] of tokens.entries()) {
    const token = list.findIndex((t) => t.word);
    if (token >= 0) return { paragraph, token };
  }
  return null;
}

export function ReaderPage({
  paragraphs,
  tokens,
  lang,
  words,
  selection,
  wide,
  activeNote,
  handlers,
}: ReaderPageProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [focused, setFocused] = useState<TokenRef | null>(null);
  const roving =
    focused && tokens[focused.paragraph]?.[focused.token]?.word ? focused : firstWordOf(tokens);
  const selectedToken = selection ? tokens[selection.paragraph]?.[selection.start] : undefined;
  const selectedKey =
    selectedToken && selection?.start === selection?.end
      ? normalizeTerm(selectedToken.text, lang)
      : null;

  const onExtend = (direction: -1 | 1) => {
    if (!selection) return;
    const list = tokens[selection.paragraph] ?? [];
    let index = direction > 0 ? selection.end + 1 : selection.start - 1;
    while (index >= 0 && index < list.length && !list[index]?.word) index += direction;
    if (index < 0 || index >= list.length) return;
    handlers.onEdge(direction > 0 ? 'end' : 'start', {
      paragraph: selection.paragraph,
      token: index,
    });
  };

  useReaderInteractions(ref, { ...handlers, onFocusToken: setFocused, onExtend });

  return (
    <div ref={ref} className={styles.text} lang={lang} data-wide={wide || undefined}>
      {paragraphs.map((paragraph, index) => {
        const list = tokens[index] ?? [];
        const text = (
          <ReaderParagraph
            paragraph={index}
            tokens={list}
            heading={paragraph.heading}
            dropCap={!paragraph.heading && index > 0 && paragraphs[index - 1]?.heading === true}
            lang={lang}
            words={words}
            selected={
              selection?.paragraph === index ? { start: selection.start, end: selection.end } : null
            }
            focusToken={roving?.paragraph === index ? roving.token : null}
          />
        );
        if (!wide || paragraph.heading) return <div key={index}>{text}</div>;
        return (
          <div key={index} className={styles.row}>
            {text}
            <aside aria-label="Notatki na marginesie" className={styles.margin}>
              <MarginNotes tokens={list} lang={lang} words={words} exclude={selectedKey} />
              {selection?.paragraph === index && activeNote}
            </aside>
          </div>
        );
      })}
    </div>
  );
}
