import { describe, expect, it } from 'vitest';
import { sha1Hex, sha256Hex } from './hash';

describe('hash', () => {
  it('liczy SHA-256 bufora jako 64 znaki hex', async () => {
    const hash = await sha256Hex(new TextEncoder().encode('abc').buffer);
    expect(hash).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
  });

  it('liczy SHA-1 tekstu jako 40 znaków hex', async () => {
    expect(await sha1Hex('abc')).toBe('a9993e364706816aba3e25717850c26c9cd0d89d');
  });
});
