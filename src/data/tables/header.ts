import type { RefTable } from '@/data/types';

/** NMAS — NMA Status (SIS ICD 3.1.1). */
export const NMAS_TABLE: RefTable = {
  id: 'nmas',
  title: 'NMAS — NMA Status',
  cols: ['Value', 'Status', 'Meaning'],
  rows: [
    [0, 'Reserved', '-'],
    [1, 'Test', 'OSNMA provided without operational guarantees.'],
    [2, 'Operational', 'OSNMA provided according to specification.'],
    [3, "Don't use", 'Navigation data shall NOT be authenticated with this OSNMA data.'],
  ],
  doc: 'icd',
  section: '3.1.1',
  caption: 'Top-level service status, carried in the NMA Header of every subframe.',
};

/** CID — Chain ID (SIS ICD 3.1.2). */
export const CID_TABLE: RefTable = {
  id: 'cid',
  title: 'CID — Chain ID',
  cols: ['Value', 'Meaning'],
  rows: [
    ['0-3', 'Identifier of the TESLA key chain currently in force; incremented (mod 4) at each chain change.'],
  ],
  doc: 'icd',
  section: '3.1.2',
  caption: 'All satellites broadcasting OSNMA share the same CID at any instant.',
};

/** CPKS — Chain and Public Key Status (SIS ICD 3.1.3). */
export const CPKS_TABLE: RefTable = {
  id: 'cpks',
  title: 'CPKS — Chain and Public Key Status',
  cols: ['Value', 'Status', 'Meaning'],
  rows: [
    [0, 'Reserved', '-'],
    [1, 'Nominal', 'Chain and public key status are nominal.'],
    [2, 'End of Chain (EOC)', 'Current chain ending; DSM-KROOT of the next chain is being broadcast.'],
    [3, 'Chain Revoked (CREV)', 'A chain is or has been revoked.'],
    [4, 'New Public Key (NPK)', 'Public key being renewed; DSM-PKR with the new key is broadcast.'],
    [5, 'Public Key Revoked (PKREV)', 'A public key is or has been revoked.'],
    [6, 'New Merkle Tree (NMT)', 'Merkle tree being renewed; obtain the new root from the GSC server.'],
    [7, 'Alert Message (AM)', 'An OSNMA Alert Message is being provided.'],
  ],
  doc: 'icd',
  section: '3.1.3',
  caption: 'Signals lifecycle events (renewals, revocations, alerts) to the receiver.',
};

export const HEADER_TABLES = [NMAS_TABLE, CID_TABLE, CPKS_TABLE];
