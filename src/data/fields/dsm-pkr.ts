import type { BitFieldSpec } from '@/data/types';

/**
 * DSM-PKR — Public Key Renewal message (SIS ICD 3.2.2).
 * Carries one Merkle leaf (a new public key) plus the four sibling nodes needed
 * to authenticate it against the stored Merkle root. Example: P-256, l_NPK = 264.
 */
export const DSM_PKR: BitFieldSpec = {
  id: 'dsm-pkr',
  title: 'DSM-PKR',
  totalBits: '1040 + l_NPK + padding bits',
  doc: 'icd',
  section: '3.2.2',
  summary:
    'Distributes a public key over the signal. The receiver hashes the key into a Merkle leaf and climbs to the root using the carried sibling nodes; if the result matches the stored root, the key is authentic.',
  fields: [
    { name: 'NB_DP', bits: 4, color: 'muted', tableId: 'nb_dp', desc: 'Number of DSM-PKR blocks.' },
    { name: 'MID', bits: 4, color: 'hash', tableId: 'mid', desc: 'Merkle leaf ID (which leaf and siblings are carried).' },
    { name: 'ITN', bits: 1024, color: 'hash', desc: 'Four 256-bit intermediate tree nodes (the sibling path).' },
    { name: 'NPKT', bits: 4, color: 'sig', tableId: 'npkt', desc: 'New public key type (ECDSA P-256/P-521 or OAM).' },
    { name: 'NPKID', bits: 4, color: 'sig', desc: 'New public key ID.' },
    { name: 'NPK', bits: 264, color: 'sig', tableId: 'ecdsa', desc: 'The new public key, compressed (264 bits for P-256).' },
    { name: 'P_DP', bits: 24, color: 'muted', desc: 'Padding to a whole number of blocks.' },
  ],
};
