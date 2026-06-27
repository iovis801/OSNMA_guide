import type { BitFieldSpec } from '@/data/types';

/** NMA Header — 8 bits, present in every 30 s subframe (SIS ICD 3.1). */
export const NMA_HEADER: BitFieldSpec = {
  id: 'nma-header',
  title: 'NMA Header',
  totalBits: '8 bits',
  doc: 'icd',
  section: '3.1',
  summary:
    'The first byte of the HKROOT stream. It announces the service status and which chain / public key are in force, so a receiver always knows how to interpret the rest of the OSNMA data.',
  fields: [
    { name: 'NMAS', bits: 2, color: 'brand', tableId: 'nmas', desc: 'NMA Status: Test, Operational or Don’t use.' },
    { name: 'CID', bits: 2, color: 'key', tableId: 'cid', desc: 'Chain ID of the TESLA chain currently in force.' },
    { name: 'CPKS', bits: 3, color: 'sig', tableId: 'cpks', desc: 'Chain and Public Key Status: lifecycle events.' },
    { name: 'Reserved', bits: 1, color: 'muted', desc: 'Reserved, set to 0.' },
  ],
};
