import { describe, it, expect } from 'vitest';
import { NMA_HEADER, DSM_KROOT, DSM_PKR, MACK, TAG_INFO, E1B_PAGE, OSNMA_FIELD } from '@/data/fields';
import { NB_DK_TABLE, NB_DP_TABLE, KS_TABLE, TS_TABLE, ADKD_TABLE } from '@/data/tables';
import * as C from '@/data/constants';
import type { BitFieldSpec } from '@/data/types';

/**
 * Deterministic structural invariants (WS1). These cannot be hallucinated: they
 * either hold or fail. They lock the bit-field layouts and value tables to the
 * verified constants so a future edit can't silently drift from the SIS ICD.
 */
function sumBits(spec: BitFieldSpec, until?: string): number {
  let total = 0;
  for (const f of spec.fields) {
    if (until && f.name === until) break;
    if (typeof f.bits === 'number') total += f.bits;
  }
  return total;
}

describe('bit-field structural invariants', () => {
  it('NMA header sums to 8 bits', () => expect(sumBits(NMA_HEADER)).toBe(C.NMA_HEADER_BITS));
  it('Tag-Info sums to 16 bits', () => expect(sumBits(TAG_INFO)).toBe(C.TAG_INFO_BITS));
  it('E1-B page sums to 120 bits', () => expect(sumBits(E1B_PAGE)).toBe(C.E1B_PAGE_BITS));

  it('OSNMA field = 40 bits = HKROOT 8 + MACK 32', () => {
    expect(sumBits(OSNMA_FIELD)).toBe(C.OSNMA_FIELD_BITS);
    const hk = OSNMA_FIELD.fields.find((f) => f.name === 'HKROOT')?.bits;
    const mk = OSNMA_FIELD.fields.find((f) => f.name === 'MACK')?.bits;
    expect(hk).toBe(C.HKROOT_BITS_PER_PAGE);
    expect(mk).toBe(C.MACK_BITS_PER_PAGE);
  });

  it('MACK message sums to 480 bits', () => expect(sumBits(MACK)).toBe(C.MACK_MSG_BITS));

  it('DSM-KROOT fixed header (before KROOT) = 104 bits', () =>
    expect(sumBits(DSM_KROOT, 'KROOT')).toBe(C.DSM_KROOT_HEADER_BITS));

  it('DSM-KROOT example total is block-aligned (832 = 8 × 104)', () => {
    const total = sumBits(DSM_KROOT);
    expect(total % C.DSM_BLOCK_BITS).toBe(0);
    expect(total).toBe(832);
  });

  it('DSM-PKR pre-NPK part = 1040 bits', () =>
    expect(sumBits(DSM_PKR, 'NPK')).toBe(C.DSM_PKR_PRENPK_BITS));

  it('DSM-PKR example total is block-aligned (1352 = 13 × 104)', () => {
    const total = sumBits(DSM_PKR);
    expect(total % C.DSM_BLOCK_BITS).toBe(0);
    expect(total).toBe(1352);
  });
});

describe('value-table arithmetic invariants', () => {
  it('NB_DK rows satisfy blocks × 104 = length', () => {
    for (const [, blocks, len] of NB_DK_TABLE.rows) {
      if (typeof blocks === 'number' && typeof len === 'number') {
        expect(len).toBe(blocks * C.DSM_BLOCK_BITS);
      }
    }
  });

  it('NB_DP rows satisfy blocks × 104 = length', () => {
    for (const [, blocks, len] of NB_DP_TABLE.rows) {
      if (typeof blocks === 'number' && typeof len === 'number') {
        expect(len).toBe(blocks * C.DSM_BLOCK_BITS);
      }
    }
  });

  it('KS = 4 → 128 bits (example config)', () =>
    expect(KS_TABLE.rows.find((r) => r[0] === 4)?.[1]).toBe(C.EXAMPLE_KS_BITS));

  it('TS = 9 → 40 bits (example config)', () =>
    expect(TS_TABLE.rows.find((r) => r[0] === 9)?.[1]).toBe(C.EXAMPLE_TS_BITS));

  it('ADKD table covers types 0, 4 and 12', () => {
    const vals = ADKD_TABLE.rows.map((r) => r[0]);
    for (const v of [0, 4, 12]) expect(vals).toContain(v);
  });
});

describe('derived-quantity consistency', () => {
  it('number of tags n_t = floor((480 − l_K)/(l_t + 16)) = 6 for the example config', () => {
    const n = Math.floor((C.MACK_MSG_BITS - C.EXAMPLE_KS_BITS) / (C.EXAMPLE_TS_BITS + C.TAG_INFO_BITS));
    expect(n).toBe(6);
  });

  it('subframe framing: 15 pages × (8 + 32) bits = 120 HKROOT + 480 MACK', () => {
    expect(C.PAGES_PER_SUBFRAME * C.HKROOT_BITS_PER_PAGE).toBe(C.HKROOT_MSG_BITS);
    expect(C.PAGES_PER_SUBFRAME * C.MACK_BITS_PER_PAGE).toBe(C.MACK_MSG_BITS);
  });

  it('time-sync thresholds: 15 = T_L/2 and 165 = (T_L + 300)/2', () => {
    expect(C.B_NORMAL_MAX_SECONDS).toBe(C.TL_SECONDS / 2);
    expect(C.B_SLOW_MAX_SECONDS).toBe((C.TL_SECONDS + C.SLOW_MAC_EXTRA_SUBFRAMES * C.SUBFRAME_SECONDS) / 2);
  });
});
