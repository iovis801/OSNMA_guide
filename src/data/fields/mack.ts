import type { BitFieldSpec } from '@/data/types';

/**
 * MACK message — 480 bits per subframe (SIS ICD 4).
 * Layout (example: l_t = 40, l_K = 128 → 6 tag slots, 16 bits padding):
 * each tag slot is l_t + 16 bits; for Tag0 those 16 bits carry MACSEQ + COP.
 */
export const MACK: BitFieldSpec = {
  id: 'mack',
  title: 'MACK message',
  totalBits: '480 bits',
  doc: 'icd',
  section: '4',
  summary:
    'The lower 32 bits of each OSNMA field, assembled over 30 s into 480 bits. It carries the tags (truncated MACs) that authenticate the previous subframe’s data, followed by the TESLA key that will verify the previous subframe’s tags.',
  fields: [
    { name: 'Tag0', bits: 40, color: 'tag', desc: 'Self-authentication tag (ADKD=0) for the transmitting satellite; CTR=1.' },
    { name: 'MACSEQ', bits: 12, color: 'tag', desc: 'Authenticates flexible Tag-Info fields.' },
    { name: 'COP', bits: 4, color: 'muted', tableId: 'cop', desc: 'Cut-off point for Tag0.' },
    { name: 'Tag1', bits: 40, color: 'tag', desc: 'Second tag (truncated MAC).' },
    { name: 'Tag-Info1', bits: 16, color: 'brand', tableId: 'adkd', desc: 'PRN_D (8) + ADKD (4) + COP (4) for Tag1.' },
    { name: '… Tags 2-5', bits: 224, color: 'tag', desc: 'Remaining tag + Tag-Info slots (56 bits each).' },
    { name: 'Key', bits: 128, color: 'key', desc: 'The disclosed TESLA chain key (length = l_K).' },
    { name: 'Padding', bits: 16, color: 'muted', desc: 'Zero padding to 480 bits.' },
  ],
};

/** Tag-Info — 16 bits, attached to every tag after Tag0 (SIS ICD 4.2.1). */
export const TAG_INFO: BitFieldSpec = {
  id: 'tag-info',
  title: 'Tag-Info',
  totalBits: '16 bits',
  doc: 'icd',
  section: '4.2.1',
  summary:
    'Describes what a tag authenticates: which satellite’s data (PRN_D), which data set and key delay (ADKD), and the maximum tag-to-data lag (COP).',
  fields: [
    { name: 'PRN_D', bits: 8, color: 'brand', tableId: 'prn_d', desc: 'PRN of the satellite whose data is authenticated.' },
    { name: 'ADKD', bits: 4, color: 'tag', tableId: 'adkd', desc: 'Authentication Data and Key Delay type.' },
    { name: 'COP', bits: 4, color: 'muted', tableId: 'cop', desc: 'Data cut-off point.' },
  ],
};
