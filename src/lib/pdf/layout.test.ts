import { describe, expect, it } from 'vitest';
import { joinLines, layoutParagraphs, type RawItem } from './layout';

const LEFT = 72;
const RIGHT = 520;

/** Linia pełnej szerokości łamu (chyba że podano inną szerokość). */
function line(
  str: string,
  y: number,
  options: { x?: number; width?: number; size?: number } = {},
): RawItem {
  const x = options.x ?? LEFT;
  return { str, x, y, width: options.width ?? RIGHT - x, height: options.size ?? 12 };
}

describe('joinLines', () => {
  it('scala wyraz podzielony na końcu linii', () => {
    expect(joinLines('she was consid-', 'ering in her own mind')).toBe(
      'she was considering in her own mind',
    );
  });

  it('zostawia łącznik przed wielką literą', () => {
    expect(joinLines('the Anglo-', 'Saxon chronicle')).toBe('the Anglo-Saxon chronicle');
  });

  it('usuwa miękki łącznik', () => {
    expect(joinLines('Unge­ziefer ver­', 'wandelt')).toBe('Unge­ziefer verwandelt');
  });

  it('łączy zwykłe linie spacją, a myślnik bez spacji', () => {
    expect(joinLines('once or twice', 'she had peeped')).toBe('once or twice she had peeped');
    expect(joinLines('and then—', 'nothing')).toBe('and then—nothing');
  });

  it('scala dzielenie w cyrylicy', () => {
    expect(joinLines('несчаст-', 'ливая семья')).toBe('несчастливая семья');
  });
});

describe('layoutParagraphs', () => {
  it('łączy linie akapitu i rozdziela akapity po wcięciu', () => {
    const paragraphs = layoutParagraphs([
      line('Alice was beginning to get very tired of sit-', 700),
      line('ting by her sister on the bank.', 686, { width: 200 }),
      line('So she was considering in her own mind', 672, { x: LEFT + 18 }),
      line('whether the pleasure would be worth it.', 658, { width: 260 }),
    ]);
    expect(paragraphs).toEqual([
      {
        text: 'Alice was beginning to get very tired of sitting by her sister on the bank.',
        heading: false,
      },
      {
        text: 'So she was considering in her own mind whether the pleasure would be worth it.',
        heading: false,
      },
    ]);
  });

  it('rozpoznaje nagłówek po większym kroju i pomija numer strony', () => {
    const paragraphs = layoutParagraphs([
      line('Down the Rabbit-Hole', 740, { size: 20, x: 200, width: 220 }),
      line('Alice was beginning to get very tired', 700),
      line('of sitting by her sister.', 686, { width: 150 }),
      line('3', 60, { x: 290, width: 6 }),
    ]);
    expect(paragraphs).toEqual([
      { text: 'Down the Rabbit-Hole', heading: true },
      { text: 'Alice was beginning to get very tired of sitting by her sister.', heading: false },
    ]);
  });

  it('dzieli akapity po większym odstępie między liniami', () => {
    const paragraphs = layoutParagraphs([
      line('First paragraph line one', 700),
      line('first paragraph line two', 686),
      line('Second paragraph after a gap', 650),
      line('continues here', 636),
    ]);
    expect(paragraphs.map((p) => p.text)).toEqual([
      'First paragraph line one first paragraph line two',
      'Second paragraph after a gap continues here',
    ]);
  });

  it('wstawia spację między osobnymi fragmentami tej samej linii i rozwija ligatury', () => {
    const paragraphs = layoutParagraphs([
      { str: 'The', x: 72, y: 700, width: 20, height: 12 },
      { str: 'ﬁrst', x: 96, y: 700, width: 24, height: 12 },
      { str: 'day', x: 124, y: 700, width: 20, height: 12 },
    ]);
    expect(paragraphs).toEqual([{ text: 'The first day', heading: false }]);
  });

  it('zwraca pustą listę dla strony bez tekstu', () => {
    expect(layoutParagraphs([])).toEqual([]);
    expect(layoutParagraphs([line('12', 60, { width: 12 })])).toEqual([]);
  });
});
