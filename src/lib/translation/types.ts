export type TranslationRequest = {
  word: string;
  sentence: string;
  sourceLang: string;
  targetLang: string;
};

export type TranslationResult = {
  translation: string;
  partOfSpeech: string;
  definition: string;
  ipa: string;
};

export type TranslationService = {
  translate: (request: TranslationRequest, signal?: AbortSignal) => Promise<TranslationResult>;
};

export type TranslationErrorKind = 'offline' | 'not-configured' | 'failed';

export class TranslationError extends Error {
  readonly kind: TranslationErrorKind;

  constructor(kind: TranslationErrorKind, message: string) {
    super(message);
    this.name = 'TranslationError';
    this.kind = kind;
  }
}
