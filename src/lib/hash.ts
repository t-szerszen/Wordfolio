function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/** SHA-256 pliku — identyfikator książki wspólny dla wszystkich urządzeń. */
export async function sha256Hex(data: ArrayBuffer): Promise<string> {
  return toHex(await crypto.subtle.digest('SHA-256', data));
}

/** Krótszy, deterministyczny identyfikator dla tekstu (np. słówka). */
export async function sha1Hex(text: string): Promise<string> {
  return toHex(await crypto.subtle.digest('SHA-1', new TextEncoder().encode(text)));
}
