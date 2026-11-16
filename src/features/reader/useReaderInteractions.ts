import { useEffect, useRef, type RefObject } from 'react';

export type TokenRef = { paragraph: number; token: number };

export type ReaderHandlers = {
  onWord: (target: TokenRef) => void;
  onEdge: (edge: 'start' | 'end', target: TokenRef) => void;
  onExtend: (direction: -1 | 1) => void;
  onBackground: () => void;
  onFocusToken: (target: TokenRef) => void;
  onSwipe: (direction: -1 | 1) => void;
};

const SWIPE_DISTANCE = 60;

function tokenOf(element: Element | null): TokenRef | null {
  const word = element?.closest<HTMLElement>('[data-token]');
  const paragraph = word?.closest<HTMLElement>('[data-paragraph]');
  if (!word || !paragraph) return null;
  return { paragraph: Number(paragraph.dataset.paragraph), token: Number(word.dataset.token) };
}

function moveFocus(container: HTMLElement, from: HTMLElement, step: number): void {
  const words = Array.from(container.querySelectorAll<HTMLElement>('[data-token]'));
  const next = words[words.indexOf(from) + step];
  next?.focus();
}

/**
 * Zdarzenia czytnika obsługujemy delegacją na kontenerze strony — setki słów
 * nie potrzebują setek słuchaczy, a przeciąganie uchwytów i gest przewijania
 * stron muszą widzieć całą powierzchnię tekstu.
 */
export function useReaderInteractions(
  ref: RefObject<HTMLElement | null>,
  handlers: ReaderHandlers,
): void {
  const latest = useRef(handlers);
  useEffect(() => {
    latest.current = handlers;
  });

  useEffect(() => {
    const container = ref.current;
    if (!container) return;
    let swipe: { x: number; y: number; id: number } | null = null;
    let suppressClick = false;
    let dragEdge: 'start' | 'end' | null = null;

    const onClick = (event: MouseEvent) => {
      if (suppressClick) {
        suppressClick = false;
        return;
      }
      if (event.target instanceof Element && event.target.closest('a, button')) return;
      const target = event.target instanceof Element ? tokenOf(event.target) : null;
      if (target) latest.current.onWord(target);
      else latest.current.onBackground();
    };

    const onKeyDown = (event: KeyboardEvent) => {
      const word =
        event.target instanceof HTMLElement
          ? event.target.closest<HTMLElement>('[data-token]')
          : null;
      if (!word) return;
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        const target = tokenOf(word);
        if (target) latest.current.onWord(target);
      } else if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        event.preventDefault();
        const step = event.key === 'ArrowRight' ? 1 : -1;
        if (event.shiftKey) latest.current.onExtend(step);
        else moveFocus(container, word, step);
      }
    };

    const onFocusIn = (event: FocusEvent) => {
      const target = event.target instanceof Element ? tokenOf(event.target) : null;
      if (target) latest.current.onFocusToken(target);
    };

    const onPointerDown = (event: PointerEvent) => {
      suppressClick = false;
      const handle =
        event.target instanceof HTMLElement
          ? event.target.closest<HTMLElement>('[data-handle]')
          : null;
      if (handle) {
        event.preventDefault();
        dragEdge = handle.dataset.handle === 'start' ? 'start' : 'end';
        container.setPointerCapture(event.pointerId);
        return;
      }
      swipe = { x: event.clientX, y: event.clientY, id: event.pointerId };
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!dragEdge) return;
      // Powiększone pole uchwytu leży nad sąsiednimi słowami — pomijamy je przy szukaniu słowa pod palcem.
      const under = document
        .elementsFromPoint(event.clientX, event.clientY)
        .find((element) => !element.closest('[data-handle]'));
      const target = tokenOf(under ?? null);
      if (target) latest.current.onEdge(dragEdge, target);
    };

    const onPointerUp = (event: PointerEvent) => {
      if (dragEdge) {
        dragEdge = null;
        suppressClick = true;
        container.releasePointerCapture(event.pointerId);
        return;
      }
      if (swipe?.id !== event.pointerId) return;
      const dx = event.clientX - swipe.x;
      const dy = event.clientY - swipe.y;
      swipe = null;
      if (Math.abs(dx) > SWIPE_DISTANCE && Math.abs(dx) > Math.abs(dy) * 2) {
        suppressClick = true;
        latest.current.onSwipe(dx < 0 ? 1 : -1);
      }
    };

    container.addEventListener('click', onClick);
    container.addEventListener('keydown', onKeyDown);
    container.addEventListener('focusin', onFocusIn);
    container.addEventListener('pointerdown', onPointerDown);
    container.addEventListener('pointermove', onPointerMove);
    container.addEventListener('pointerup', onPointerUp);
    container.addEventListener('pointercancel', onPointerUp);
    return () => {
      container.removeEventListener('click', onClick);
      container.removeEventListener('keydown', onKeyDown);
      container.removeEventListener('focusin', onFocusIn);
      container.removeEventListener('pointerdown', onPointerDown);
      container.removeEventListener('pointermove', onPointerMove);
      container.removeEventListener('pointerup', onPointerUp);
      container.removeEventListener('pointercancel', onPointerUp);
    };
  }, [ref]);
}
