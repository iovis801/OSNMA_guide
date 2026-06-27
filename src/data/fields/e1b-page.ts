import type { BitFieldSpec } from '@/data/types';

/** Galileo E1-B I/NAV nominal page — 120 bits (SIS ICD section 2). */
export const E1B_PAGE: BitFieldSpec = {
  id: 'e1b-page',
  title: 'E1-B I/NAV nominal page',
  totalBits: '120 bits',
  doc: 'icd',
  section: '2',
  summary:
    'One Galileo E1-B page. OSNMA rides in a dedicated 40-bit field of the odd pages; the rest carries navigation data, search-and-rescue, CRC and synchronisation.',
  fields: [
    { name: 'Even/odd', bits: 1, color: 'muted', desc: 'Page parity flag.' },
    { name: 'Page type', bits: 1, color: 'muted', desc: 'Nominal or alert page.' },
    { name: 'Data j (2/2)', bits: 16, color: 'brand', desc: 'Second half of the navigation data word.' },
    { name: 'OSNMA', bits: 40, color: 'tag', desc: 'The OSNMA field: 8-bit HKROOT + 32-bit MACK.' },
    { name: 'SAR', bits: 22, color: 'muted', desc: 'Search-and-rescue return-link data.' },
    { name: 'Spare', bits: 2, color: 'muted', desc: 'Spare bits.' },
    { name: 'CRC', bits: 24, color: 'hash', desc: 'Cyclic redundancy check over the page.' },
    { name: 'SSP', bits: 8, color: 'muted', desc: 'Secondary synchronisation pattern.' },
    { name: 'Tail', bits: 6, color: 'muted', desc: 'Convolutional-code tail bits.' },
  ],
};

/** The 40-bit OSNMA field carried per page (SIS ICD section 2 / 3). */
export const OSNMA_FIELD: BitFieldSpec = {
  id: 'osnma-field',
  title: 'OSNMA field (per page)',
  totalBits: '40 bits',
  doc: 'icd',
  section: '2',
  summary:
    'Each page contributes 8 bits to the slow HKROOT stream and 32 bits to the fast MACK stream. Over the 15 pages of a 30 s subframe these build a 120-bit HKROOT message and a 480-bit MACK message.',
  fields: [
    { name: 'HKROOT', bits: 8, color: 'sig', desc: 'Slow stream: NMA Header, DSM Header and DSM-KROOT/PKR blocks.' },
    { name: 'MACK', bits: 32, color: 'tag', desc: 'Fast stream: tags and the disclosed TESLA key.' },
  ],
};
