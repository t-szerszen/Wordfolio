import { describe, expect, it } from 'vitest';
import { detectLanguage } from './detect';

const SAMPLES: Record<string, string> = {
  en: 'Alice was beginning to get very tired of sitting by her sister on the bank, and of having nothing to do: once or twice she had peeped into the book her sister was reading.',
  de: 'Als Gregor Samsa eines Morgens aus unruhigen Träumen erwachte, fand er sich in seinem Bett zu einem ungeheueren Ungeziefer verwandelt. Er lag auf seinem panzerartig harten Rücken und sah, wenn er den Kopf ein wenig hob, seinen gewölbten Bauch.',
  fr: 'Lorsque j’avais six ans j’ai vu, une fois, une magnifique image, dans un livre sur la forêt vierge qui s’appelait Histoires vécues. Ça représentait un serpent boa qui avalait un fauve. Voilà la copie du dessin.',
  es: 'En un lugar de la Mancha, de cuyo nombre no quiero acordarme, no ha mucho tiempo que vivía un hidalgo de los de lanza en astillero, adarga antigua, rocín flaco y galgo corredor.',
  pl: 'Litwo! Ojczyzno moja! ty jesteś jak zdrowie. Ile cię trzeba cenić, ten tylko się dowie, kto cię stracił. Dziś piękność twą w całej ozdobie widzę i opisuję, bo tęsknię po tobie, i nie wiem, czy to jest sen.',
  ru: 'Все счастливые семьи похожи друг на друга, каждая несчастливая семья несчастлива по-своему. Все смешалось в доме Облонских.',
  uk: 'Як умру, то поховайте мене на могилі серед степу широкого, на Вкраїні милій, щоб лани широкополі, і Дніпро, і кручі було видно, було чути, як реве ревучий.',
  ja: '吾輩は猫である。名前はまだ無い。どこで生れたかとんと見当がつかぬ。何でも薄暗いじめじめした所でニャーニャー泣いていた事だけは記憶している。',
};

describe('detectLanguage', () => {
  for (const [lang, text] of Object.entries(SAMPLES)) {
    it(`rozpoznaje ${lang}`, () => {
      expect(detectLanguage(text)).toBe(lang);
    });
  }

  it('używa podpowiedzi z PDF, jeśli jest poprawna', () => {
    expect(detectLanguage('cokolwiek', 'en-GB')).toBe('en');
  });

  it('zwraca null dla zbyt krótkiego tekstu', () => {
    expect(detectLanguage('Hello there')).toBeNull();
  });
});
