import { describe, expect, it } from 'vitest';
import { normalizeTerm, tokenize } from './tokenize';

const words = (text: string, lang: string) =>
  tokenize(text, lang)
    .filter((t) => t.word)
    .map((t) => t.text);

describe('tokenize', () => {
  it('dzieli zdanie na słowa i zachowuje pozycje', () => {
    const tokens = tokenize('Alice was tired.', 'en');
    expect(tokens.map((t) => t.text).join('')).toBe('Alice was tired.');
    expect(tokens.filter((t) => t.word).map((t) => [t.text, t.start])).toEqual([
      ['Alice', 0],
      ['was', 6],
      ['tired', 10],
    ]);
  });

  it('trzyma słowa z łącznikiem razem', () => {
    expect(words('a daisy-chain and a waistcoat-pocket', 'en')).toEqual([
      'a',
      'daisy-chain',
      'and',
      'a',
      'waistcoat-pocket',
    ]);
  });

  it('nie łączy myślnika otoczonego spacjami', () => {
    expect(words('tired - and sleepy', 'en')).toEqual(['tired', 'and', 'sleepy']);
  });

  it('zostawia apostrof w angielskich skrótach', () => {
    expect(words('I shan’t be late, she’d said', 'en')).toEqual([
      'I',
      'shan’t',
      'be',
      'late',
      'she’d',
      'said',
    ]);
  });

  it('odcina francuską elizję', () => {
    expect(words("l’homme et l'enfant", 'fr')).toEqual(['homme', 'et', 'enfant']);
  });

  it('pomija interpunkcję i cudzysłowy', () => {
    expect(words('‘Oh dear! Oh dear!’', 'en')).toEqual(['Oh', 'dear', 'Oh', 'dear']);
  });

  it('obsługuje cyrylicę i niemieckie znaki', () => {
    expect(words('Все счастливые семьи', 'ru')).toEqual(['Все', 'счастливые', 'семьи']);
    expect(words('aus unruhigen Träumen', 'de')).toEqual(['aus', 'unruhigen', 'Träumen']);
  });

  it('dzieli japoński tekst bez spacji na słowa', () => {
    const result = words('吾輩は猫である', 'ja');
    expect(result.length).toBeGreaterThan(1);
    expect(result.join('')).toBe('吾輩は猫である');
  });
});

describe('normalizeTerm', () => {
  it('ujednolica wielkość liter, apostrofy i miękkie łączniki', () => {
    expect(normalizeTerm('Shan’t', 'en')).toBe("shan't");
    expect(normalizeTerm('Unge­ziefer', 'de')).toBe('ungeziefer');
    expect(normalizeTerm('  Out  of the   way ', 'en')).toBe('out of the way');
  });

  it('respektuje reguły języka przy małych literach', () => {
    expect(normalizeTerm('İSTANBUL', 'tr')).toBe('istanbul');
  });
});
