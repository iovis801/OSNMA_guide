/**
 * Real OSNMA cryptographic material from the official EUSPA test vectors,
 * annex to the Galileo OSNMA Receiver Guidelines v1.3.
 *
 * Source file:
 *   cryptographic_material/Merkle_tree_1/MerkleTree/
 *     OSNMA_MerkleTree_20230803105953_newPKID_1.xml
 *
 * This tree (N = 16, SHA-256) ships the public key for leaf index 0 (PKID 1)
 * together with the four sibling nodes needed to authenticate it, plus the root.
 * The Merkle Tree Explorer recomputes the root from this data and self-checks it
 * against `root` below — if they ever diverge, the demo is wrong, not just untested.
 */
export interface MerkleTreeVector {
  uid: string;
  hashFunction: 'SHA-256';
  n: number;
  issueDate: string;
  applicabilityBegin: string;
  /** The provided leaf (a public key). */
  leaf: {
    index: number;
    pkid: number;
    npkt: number; // 1 = ECDSA P-256
    npktLabel: string;
    lengthInBits: number;
    pointHex: string; // compressed ECDSA P-256 point (33 bytes)
  };
  /** Sibling nodes from level 0 up to level 3, in bottom-up order. */
  siblings: { level: number; index: number; xHex: string }[];
  /** Root node x_4,0. */
  root: string;
}

export const MERKLE_TREE_1: MerkleTreeVector = {
  uid: 'AA1AC9A4FFA41F00DC5BA63B0CD30129A9E1E9BCBC3FB7731B41F7EB63208BAE',
  hashFunction: 'SHA-256',
  n: 16,
  issueDate: '2023-08-03T10:59:53Z',
  applicabilityBegin: '2023-08-03T10:59:52Z',
  leaf: {
    index: 0,
    pkid: 1,
    npkt: 1,
    npktLabel: 'ECDSA P-256/SHA-256',
    lengthInBits: 264,
    pointHex: '0374A925CFA0FF1805E5C5A58FDBA31BF0145D5B5BE2F062D3F8BB2EE98F0F6DB0',
  },
  siblings: [
    { level: 0, index: 1, xHex: '01631BDCED79D4317BC2870EE3895BD59CF2B6EA516FABBFDF1D739626146FFE' },
    { level: 1, index: 1, xHex: '316FA9285F5A1E44042413BDAF18AA3CF684723397D7B8325AECA1EBCA9F0F64' },
    { level: 2, index: 1, xHex: '9905424CBE482A1A32B01064F85D0C36DF038E52CE128E7EC5F323E165B182A7' },
    { level: 3, index: 1, xHex: '1537BDB010972EB4A3B90BAACD14941EF40DA2CB2B82D378B315C008DECEFD8E' },
  ],
  root: '0E63F552C8021709043C239032EFFE941BF22C8389032F5F2701E0FBC80148B8',
};
