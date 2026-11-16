import type { KeyboardEvent } from 'react';

const NEXT = new Set(['ArrowRight', 'ArrowDown']);
const PREVIOUS = new Set(['ArrowLeft', 'ArrowUp']);

/**
 * Wzorzec grupy radiowej (ARIA APG): jeden przystanek Tab na grupę, strzałki zmieniają wybór
 * i przenoszą fokus — tego oczekują czytniki ekranu po zapowiedzi „przycisk opcji 1 z 3”.
 */
export function useRadioGroup<T>(values: readonly T[], selected: T, onSelect: (value: T) => void) {
  const selectedIndex = Math.max(0, values.indexOf(selected));
  return (value: T) => {
    const index = values.indexOf(value);
    return {
      role: 'radio' as const,
      'aria-checked': index === values.indexOf(selected),
      tabIndex: index === selectedIndex ? 0 : -1,
      onClick: () => {
        onSelect(value);
      },
      onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
        const step = NEXT.has(event.key) ? 1 : PREVIOUS.has(event.key) ? -1 : 0;
        if (step === 0) return;
        event.preventDefault();
        const nextIndex = (index + step + values.length) % values.length;
        const next = values[nextIndex];
        if (next === undefined) return;
        onSelect(next);
        const radios =
          event.currentTarget.parentElement?.querySelectorAll<HTMLElement>('[role="radio"]');
        radios?.[nextIndex]?.focus();
      },
    };
  };
}
