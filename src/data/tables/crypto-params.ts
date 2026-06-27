import type { RefTable } from '@/data/types';

/** HF — Hash Function (SIS ICD 3.2.3.4). */
export const HF_TABLE: RefTable = {
  id: 'hf',
  title: 'HF — Hash Function',
  cols: ['Value', 'Hash function'],
  rows: [
    [0, 'SHA-256'],
    [1, 'Reserved'],
    [2, 'SHA3-256'],
    [3, 'Reserved'],
  ],
  doc: 'icd',
  section: '3.2.3.4',
  highlightRow: 0,
  caption: '2-bit field selecting the hash used for the TESLA chain and Merkle tree.',
};

/** MF — MAC Function (SIS ICD 3.2.3.5). */
export const MF_TABLE: RefTable = {
  id: 'mf',
  title: 'MF — MAC Function',
  cols: ['Value', 'MAC function'],
  rows: [
    [0, 'HMAC-SHA-256'],
    [1, 'CMAC-AES'],
    [2, 'Reserved'],
    [3, 'Reserved'],
  ],
  doc: 'icd',
  section: '3.2.3.5',
  highlightRow: 0,
  caption: '2-bit field selecting the MAC used to compute tags and MACSEQ.',
};

/** KS — Key Size (SIS ICD 3.2.3.6). */
export const KS_TABLE: RefTable = {
  id: 'ks',
  title: 'KS — Key Size',
  cols: ['Value', 'Key length l_K (bits)'],
  rows: [
    [0, 96],
    [1, 104],
    [2, 112],
    [3, 120],
    [4, 128],
    [5, 160],
    [6, 192],
    [7, 224],
    [8, 256],
    ['9-15', 'Reserved'],
  ],
  doc: 'icd',
  section: '3.2.3.6',
  highlightRow: 4,
  caption: 'Length of each TESLA chain key. The test vectors use KS = 4 (128 bits).',
};

/** TS — Tag Size (SIS ICD 3.2.3.7). */
export const TS_TABLE: RefTable = {
  id: 'ts',
  title: 'TS — Tag Size',
  cols: ['Value', 'Tag length l_t (bits)'],
  rows: [
    ['0-4', 'Reserved'],
    [5, 20],
    [6, 24],
    [7, 28],
    [8, 32],
    [9, 40],
    ['10-15', 'Reserved'],
  ],
  doc: 'icd',
  section: '3.2.3.7',
  highlightRow: 5,
  caption: 'Length of each truncated MAC (tag). The test vectors use TS = 9 (40 bits).',
};

/** ECDSA signature/key sizes (SIS ICD 3.2.2.6, 3.2.3.12, 6.1.1). */
export const ECDSA_TABLE: RefTable = {
  id: 'ecdsa',
  title: 'ECDSA curves, key and signature sizes',
  cols: ['Curve / hash', 'Compressed public key (bits)', 'Signature (bits)'],
  rows: [
    ['P-256 / SHA-256', 264, 512],
    ['P-521 / SHA-512', 536, 1056],
  ],
  doc: 'icd',
  section: '3.2.2.6 / 6.1.1',
  caption: 'Public keys are broadcast in compressed point form.',
};

export const CRYPTO_PARAM_TABLES = [HF_TABLE, MF_TABLE, KS_TABLE, TS_TABLE, ECDSA_TABLE];
