import { hexToBytes, bytesToHex, concatBytes } from './bytes';
import { type HashName, hashFn } from './hash';

/**
 * Merkle tree authentication of OSNMA public keys (SIS ICD 6.2, Rx Guidelines 5.1).
 *
 *   leaf   m_i   = NPKT(4 bits) ‖ NPKID(4 bits) ‖ NPK
 *   base   x_0,i = H(m_i)
 *   node   x_j,i = H(x_{j-1,2i} ‖ x_{j-1,2i+1})
 *   root   x_4,0
 *
 * A receiver verifies a public key by recomputing the root from the leaf and the
 * four sibling nodes carried in the DSM-PKR, then comparing it to the stored root.
 */

/** Build leaf m_i = NPKT(4b) ‖ NPKID(4b) ‖ NPK from the compressed key hex. */
export function buildLeaf(npkt: number, npkid: number, npkHex: string): Uint8Array {
  const head = ((npkt & 0x0f) << 4) | (npkid & 0x0f);
  return concatBytes(Uint8Array.of(head), hexToBytes(npkHex));
}

export interface MerkleStep {
  level: number; // resulting node level (1..4)
  siblingOnRight: boolean;
  left: string;
  right: string;
  out: string;
}

export interface MerkleResult {
  leafHash: string; // x_0,leafIndex
  steps: MerkleStep[];
  root: string; // computed x_4,0
}

/**
 * Recompute the Merkle root from a leaf and its sibling chain (bottom to top).
 * `siblingsHex` are ordered from the lowest level upward, exactly as carried in
 * the DSM-PKR ITN field for the given leaf index.
 */
export function computeRoot(
  leafIndex: number,
  leaf: Uint8Array,
  siblingsHex: string[],
  name: HashName,
): MerkleResult {
  const H = hashFn(name);
  let node = H(leaf);
  const leafHash = bytesToHex(node);
  let idx = leafIndex;
  const steps: MerkleStep[] = [];

  siblingsHex.forEach((sibHex, i) => {
    const sib = hexToBytes(sibHex);
    const siblingOnRight = idx % 2 === 0;
    const left = siblingOnRight ? node : sib;
    const right = siblingOnRight ? sib : node;
    const out = H(concatBytes(left, right));
    steps.push({
      level: i + 1,
      siblingOnRight,
      left: bytesToHex(left),
      right: bytesToHex(right),
      out: bytesToHex(out),
    });
    node = out;
    idx = Math.floor(idx / 2);
  });

  return { leafHash, steps, root: bytesToHex(node) };
}
