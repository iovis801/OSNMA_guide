import type { BitFieldSpec } from '@/data/types';

/**
 * DSM-KROOT — the digitally signed TESLA root key (SIS ICD 3.2.3).
 * The first 104 bits are a fixed header; KROOT, the signature and padding follow.
 * Example widths below assume KS = 128 bits, P-256 signature = 512 bits.
 */
export const DSM_KROOT: BitFieldSpec = {
  id: 'dsm-kroot',
  title: 'DSM-KROOT',
  totalBits: '104 + l_K + l_DS + padding bits',
  doc: 'icd',
  section: '3.2.3',
  summary:
    'Delivers the root key (KROOT) of a TESLA chain together with an ECDSA signature over it. A receiver checks this signature with a verified public key to anchor the whole chain of trust.',
  fields: [
    { name: 'NB_DK', bits: 4, color: 'muted', tableId: 'nb_dk', desc: 'Number of DSM-KROOT blocks (sets total length).' },
    { name: 'PKID', bits: 4, color: 'sig', desc: 'ID of the public key used to verify this signature.' },
    { name: 'CIDKR', bits: 2, color: 'key', desc: 'Chain ID of the KROOT (may differ from CID during renewal).' },
    { name: 'Reserved', bits: 2, color: 'muted', desc: 'Reserved.' },
    { name: 'HF', bits: 2, color: 'hash', tableId: 'hf', desc: 'Hash function for the chain.' },
    { name: 'MF', bits: 2, color: 'tag', tableId: 'mf', desc: 'MAC function for tags.' },
    { name: 'KS', bits: 4, color: 'key', tableId: 'ks', desc: 'Key size l_K.' },
    { name: 'TS', bits: 4, color: 'tag', tableId: 'ts', desc: 'Tag size l_t.' },
    { name: 'MACLT', bits: 8, color: 'tag', tableId: 'maclt', desc: 'MAC look-up table ID (tag sequence).' },
    { name: 'Reserved', bits: 4, color: 'muted', desc: 'Reserved.' },
    { name: 'WN_K', bits: 12, color: 'brand', desc: 'KROOT week number (GST).' },
    { name: 'TOWH_K', bits: 8, color: 'brand', desc: 'KROOT time of week, in hours (0-167).' },
    { name: 'α', bits: 48, color: 'key', desc: 'Random chain pattern, mixed into every key derivation.' },
    { name: 'KROOT', bits: 128, color: 'key', desc: 'The root key K_0 (length = l_K; 128 bits shown).' },
    { name: 'DS', bits: 512, color: 'sig', tableId: 'ecdsa', desc: 'ECDSA signature over the header + KROOT (512 bits for P-256).' },
    { name: 'P_DK', bits: 88, color: 'muted', desc: 'Padding to a whole number of 104-bit blocks (88 bits here → 104 + 128 + 512 + 88 = 832 = 8 × 104, i.e. NB_DK = 2).' },
  ],
};
