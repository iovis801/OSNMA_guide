import { sha256 } from '@noble/hashes/sha2';
import { sha3_256 } from '@noble/hashes/sha3';
import { hexToBytes, bytesToHex } from './bytes';

/** Hash functions OSNMA can select via the HF field (SIS ICD 3.2.3.4). */
export type HashName = 'SHA-256' | 'SHA3-256';

export function hashFn(name: HashName): (msg: Uint8Array) => Uint8Array {
  return name === 'SHA3-256' ? sha3_256 : sha256;
}

export function hash(name: HashName, ...parts: Uint8Array[]): Uint8Array {
  const total = parts.reduce((n, p) => n + p.length, 0);
  const buf = new Uint8Array(total);
  let off = 0;
  for (const p of parts) {
    buf.set(p, off);
    off += p.length;
  }
  return hashFn(name)(buf);
}

/**
 * Keep the `bits` most-significant bits of a byte array (SIS ICD trunc operator,
 * 6.1.2). Only byte-aligned truncation is needed for OSNMA key/tag sizes here.
 */
export function truncBits(bytes: Uint8Array, bits: number): Uint8Array {
  const fullBytes = Math.floor(bits / 8);
  const rem = bits % 8;
  if (rem === 0) return bytes.slice(0, fullBytes);
  const out = bytes.slice(0, fullBytes + 1);
  const mask = 0xff << (8 - rem);
  out[fullBytes] = out[fullBytes] & mask;
  return out;
}

export function truncHex(hex: string, bits: number): string {
  return bytesToHex(truncBits(hexToBytes(hex), bits));
}
