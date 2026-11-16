import { describe, expect, it } from 'vitest';
import { stepFontSize } from './typography';

describe('stepFontSize', () => {
  it('przechodzi po krokach z designu', () => {
    expect(stepFontSize(19, 1)).toBe(20);
    expect(stepFontSize(20, 1)).toBe(22);
    expect(stepFontSize(16, -1)).toBe(16);
    expect(stepFontSize(24, 1)).toBe(24);
  });

  it('wyrównuje rozmiar spoza listy do najbliższego kroku', () => {
    expect(stepFontSize(21, -1)).toBe(20);
    expect(stepFontSize(30, -1)).toBe(22);
  });
});
