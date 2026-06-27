import { hexToBytes, bytesToHex, concatBytes } from './bytes';
import { type HashName, hashFn, truncBits } from './hash';

/**
 * TESLA one-way key chain (SIS ICD 6.4, Rx Guidelines 5.4).
 *
 *   K_I = F(K_{I+1}) = trunc(l_k, hash( K_{I+1} ‖ GST_{SF,I} ‖ α ))
 *
 * Keys are generated from a secret seed K_N down to the public root K_0, then
 * broadcast in the reverse order. Anyone can walk a disclosed key *back* toward
 * K_0 with F, but nobody can walk *forward* to predict an undisclosed key — that
 * asymmetry is what makes a delayed key usable as proof of authenticity.
 */

/** Encode GST_SF as 32 bits: WN (12 bits) ‖ TOW (20 bits). */
export function encodeGstSf(wn: number, tow: number): Uint8Array {
  const v = ((wn & 0xfff) * (1 << 20) + (tow & 0xfffff)) >>> 0;
  return Uint8Array.of((v >>> 24) & 0xff, (v >>> 16) & 0xff, (v >>> 8) & 0xff, v & 0xff);
}

/** One application of F: derive the previous key K_I from K_{I+1}. */
export function hashChainStep(
  keyBytes: Uint8Array,
  gstSf: Uint8Array,
  alpha: Uint8Array,
  lkBits: number,
  name: HashName,
): Uint8Array {
  const digest = hashFn(name)(concatBytes(keyBytes, gstSf, alpha));
  return truncBits(digest, lkBits);
}

export interface ChainKey {
  index: number; // I (0 = root KROOT)
  wn: number;
  tow: number;
  keyHex: string;
}

/**
 * Generate an illustrative chain of `count` keys plus the root (indices count..0).
 * The chain is internally consistent: re-applying F to any disclosed key
 * eventually reproduces K_0, which is exactly what a receiver checks.
 */
export function deriveChain(
  seedHex: string,
  alphaHex: string,
  lkBits: number,
  name: HashName,
  count: number,
  wn: number,
  tow0: number,
  stepSec = 30,
): ChainKey[] {
  const alpha = hexToBytes(alphaHex);
  const keys: ChainKey[] = [];
  let current = truncBits(hexToBytes(seedHex), lkBits);
  // Seed is K_count; derive downward to K_0.
  for (let i = count; i >= 0; i--) {
    const tow = tow0 + i * stepSec;
    keys[i] = { index: i, wn, tow, keyHex: bytesToHex(current) };
    if (i > 0) {
      const gst = encodeGstSf(wn, tow);
      current = hashChainStep(current, gst, alpha, lkBits, name);
    }
  }
  return keys;
}

export interface VerifyResult {
  ok: boolean;
  iterations: number;
  derivedRootHex: string;
}

/**
 * Verify a received key K_I against a trusted earlier key K_J (J < I) by applying
 * F exactly (I - J) times and comparing the result to K_J (Rx Guidelines 5.4.2).
 */
export function verifyChainKey(
  received: ChainKey,
  trusted: ChainKey,
  alphaHex: string,
  lkBits: number,
  name: HashName,
  stepSec = 30,
): VerifyResult {
  const alpha = hexToBytes(alphaHex);
  let current = hexToBytes(received.keyHex);
  const iterations = received.index - trusted.index;
  for (let i = received.index; i > trusted.index; i--) {
    const tow = received.tow - (received.index - i) * stepSec;
    const gst = encodeGstSf(received.wn, tow);
    current = hashChainStep(current, gst, alpha, lkBits, name);
  }
  const derivedRootHex = bytesToHex(current);
  return { ok: derivedRootHex === trusted.keyHex, iterations, derivedRootHex };
}
