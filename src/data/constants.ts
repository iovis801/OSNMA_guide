/**
 * Single source of truth for the numeric constants the site teaches.
 * Every value here is verified against the official Galileo OSNMA SIS ICD v1.1
 * (and Receiver Guidelines v1.3) — see docs/verification/claims-ledger.md — and
 * cross-checked against the OSNMAlib reference implementation. The deterministic
 * invariant tests (constants.test.ts) assert the data layer stays consistent with
 * these values, so a future edit can't silently drift.
 */

// Signal / framing (SIS ICD §2)
export const SUBFRAME_SECONDS = 30;
export const PAGES_PER_SUBFRAME = 15;
export const E1B_PAGE_BITS = 120;
export const OSNMA_FIELD_BITS = 40;
export const HKROOT_BITS_PER_PAGE = 8;
export const MACK_BITS_PER_PAGE = 32;
export const HKROOT_MSG_BITS = 120; // 15 × 8
export const MACK_MSG_BITS = 480; // 15 × 32
export const DSM_BLOCK_BITS = 104;

// Message layouts (SIS ICD §3–4)
export const NMA_HEADER_BITS = 8;
export const TAG_INFO_BITS = 16;
export const DSM_KROOT_HEADER_BITS = 104; // fixed part before KROOT (§3.2.3)
export const DSM_PKR_PRENPK_BITS = 1040; // NB_DP+MID+ITN+NPKT+NPKID (§3.2.2)
export const MACSEQ_BITS = 12;

// Cryptographic sizes (SIS ICD §3.2.2.6 / §3.2.3 / §6)
export const ALPHA_BITS = 48;
export const MERKLE_LEAVES = 16;
export const MERKLE_LEVELS = 4;
export const MERKLE_NODE_BITS = 256;
export const GST_WN_BITS = 12;
export const GST_TOW_BITS = 20;
export const GST_BITS = 32;
export const P256_NPK_BITS = 264;
export const P521_NPK_BITS = 536;
export const P256_SIG_BITS = 512;
export const P521_SIG_BITS = 1056;

// Receiver timing (Receiver Guidelines §2.1 / §3.2 / §3.3)
export const TL_SECONDS = 30;
export const B_NORMAL_MAX_SECONDS = 15; // T_L / 2
export const B_SLOW_MAX_SECONDS = 165; // (T_L + 300) / 2
export const SLOW_MAC_EXTRA_SUBFRAMES = 10;
export const KROOT_WINDOW_SECONDS = 3600; // DSM-KROOT reception window (1 h)
export const PKR_WINDOW_SECONDS = 13 * 3600; // DSM-PKR reception window (13 h)

// Example configuration used by the demos (matches the official test vectors)
export const EXAMPLE_KS_BITS = 128; // KS = 4
export const EXAMPLE_TS_BITS = 40; // TS = 9
export const EXAMPLE_MACLT = 34;
