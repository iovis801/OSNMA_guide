import { describe, it, expect } from 'vitest';
import { buildLeaf, computeRoot } from './merkle';
import { deriveChain, verifyChainKey } from './tesla';
import { truncBits } from './hash';
import { hexToBytes, bytesToHex } from './bytes';
import { MERKLE_TREE_1 } from '@/data/testvectors/merkle-tree-1';

describe('Merkle tree authentication (official test vector)', () => {
  it('recomputes the published root from leaf 0 and its sibling path', () => {
    const t = MERKLE_TREE_1;
    const leaf = buildLeaf(t.leaf.npkt, t.leaf.pkid, t.leaf.pointHex);
    const result = computeRoot(
      t.leaf.index,
      leaf,
      t.siblings.map((s) => s.xHex),
      t.hashFunction,
    );
    expect(result.root.toUpperCase()).toBe(t.root.toUpperCase());
  });

  it('produces exactly four climb steps (16-leaf tree)', () => {
    const t = MERKLE_TREE_1;
    const leaf = buildLeaf(t.leaf.npkt, t.leaf.pkid, t.leaf.pointHex);
    const result = computeRoot(t.leaf.index, leaf, t.siblings.map((s) => s.xHex), t.hashFunction);
    expect(result.steps).toHaveLength(4);
    // Leaf 0 sits on the far left, so every sibling is on the right.
    expect(result.steps.every((s) => s.siblingOnRight)).toBe(true);
  });

  it('rejects a tampered public key', () => {
    const t = MERKLE_TREE_1;
    const tampered = t.leaf.pointHex.replace(/.$/, (c) => (c === '0' ? '1' : '0'));
    const leaf = buildLeaf(t.leaf.npkt, t.leaf.pkid, tampered);
    const result = computeRoot(t.leaf.index, leaf, t.siblings.map((s) => s.xHex), t.hashFunction);
    expect(result.root.toUpperCase()).not.toBe(t.root.toUpperCase());
  });
});

describe('TESLA one-way key chain', () => {
  const seed = '0f1e2d3c4b5a69788796a5b4c3d2e1f0';
  const alpha = '610bdf26d77b'; // 48-bit pattern, matching the annex example length

  it('verifies a disclosed key back to the root', () => {
    const chain = deriveChain(seed, alpha, 128, 'SHA-256', 10, 1248, 0);
    const res = verifyChainKey(chain[7], chain[0], alpha, 128, 'SHA-256');
    expect(res.ok).toBe(true);
    expect(res.iterations).toBe(7);
  });

  it('fails verification for a forged key', () => {
    const chain = deriveChain(seed, alpha, 128, 'SHA-256', 10, 1248, 0);
    const forged = { ...chain[5], keyHex: chain[5].keyHex.replace(/^.{2}/, 'ff') };
    const res = verifyChainKey(forged, chain[0], alpha, 128, 'SHA-256');
    expect(res.ok).toBe(false);
  });
});

describe('trunc operator', () => {
  it('keeps the most-significant bits', () => {
    const bytes = hexToBytes('abcdef12');
    expect(bytesToHex(truncBits(bytes, 16))).toBe('abcd');
  });
});
