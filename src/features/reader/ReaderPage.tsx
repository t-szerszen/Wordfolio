import { useMemo, useRef, useState } from 'react';
import type { WordStatus } from '../../lib/data/models';
import type { Paragraph } from '../../lib/pdf/layout';
import { tokenize } from '../../lib/text/tokenize';
import { ReaderParagraph } from './ReaderParagraph';
import type { Selection } from './selection';
import { useReaderInteractions, type ReaderHandlers, type TokenRef } from './useReaderInteractions';
import styles from './ReaderPage.module.css';

type ReaderPageProps = {
  paragraphs: readonly Paragraph[];
  lang: string;
  statuses: ReadonlyMap<string, WordStatus> | null;
  selection: Selection | null;
  handlers: Omit<ReaderHandlers, 'onFocusToken' | 'onExtend'>;
};

function firstWordOf(tokens: readonly (readonly { word: boolean }[])[]): TokenRef | null {
  for (const [paragraph, list] of tokens.entries()) {
    const token = list.findIndex((t) => t.word);
    if (token >= 0) return { paragraph, token };
  }
  return null;
}

export function ReaderPage({ paragraphs, lang, statuses, selection, handlers }: ReaderPageProps) {
  const ref = useRef<HTMLDivElement>(null);
  const tokens = useMemo(() => paragraphs.map((p) => tokenize(p.text, lang)), [paragraphs, lang]);
  const firstWord = firstWordOf(tokens);
  const [focused, setFocused] = useState<TokenRef | null>(null);
  const roving = focused && tokens[focused.paragraph]?.[focused.token]?.word ? focused : firstWord;

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
    <div ref={ref} className={styles.text} lang={lang}>
      {paragraphs.map((paragraph, index) => (
        <ReaderParagraph
          key={index}
          index={index}
          tokens={tokens[index] ?? []}
          heading={paragraph.heading}
          dropCap={!paragraph.heading && index > 0 && paragraphs[index - 1]?.heading === true}
          lang={lang}
          statuses={statuses}
          selected={
            selection?.paragraph === index ? { start: selection.start, end: selection.end } : null
          }
          focusToken={roving?.paragraph === index ? roving.token : null}
        />
      ))}
    </div>
  );
}
