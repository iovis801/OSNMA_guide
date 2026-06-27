/**
 * OSNMA key-management lifecycle events and the receiver actions they trigger
 * (Receiver Guidelines v1.3, section 4.2; mapped to the test-vector scenarios).
 * NMAS shows the service status during each phase; testVector points at the
 * official scenario folder that exercises it.
 */
export type Nmas = 'Operational' | "Don't use";

export interface LifecyclePhase {
  label: string;
  testVector?: string;
  nmas: Nmas;
  actions: string[];
}

export interface LifecycleEvent {
  id: string;
  abbr: string;
  name: string;
  cpks: number;
  color: 'key' | 'sig' | 'hash' | 'bad' | 'brand' | 'tag';
  summary: string;
  section: string;
  phases: LifecyclePhase[];
}

export const LIFECYCLE_EVENTS: LifecycleEvent[] = [
  {
    id: 'eoc',
    abbr: 'EOC',
    name: 'End of Chain',
    cpks: 2,
    color: 'key',
    summary: 'The current TESLA chain is ending and the next one is broadcast ahead of time, so authentication never pauses.',
    section: '4.2.2',
    phases: [
      {
        label: 'New chain announced',
        testVector: 'eoc_step1',
        nmas: 'Operational',
        actions: [
          'CPKS reads End of Chain; keep authenticating with the current chain (CID = i).',
          'Retrieve the new DSM-KROOT for chain CID = i′ and verify its signature with the current public key.',
          'Store the new chain parameters, ready for the hand-over.',
        ],
      },
      {
        label: 'New chain in force',
        testVector: 'eoc_step2',
        nmas: 'Operational',
        actions: [
          'At the applicability time, switch to the new chain (CID = i′).',
          'CPKS returns to Nominal; authentication continues uninterrupted.',
        ],
      },
    ],
  },
  {
    id: 'crev',
    abbr: 'CREV',
    name: 'Chain Revoked',
    cpks: 3,
    color: 'bad',
    summary: 'A chain is revoked. Authentication stops until a fresh chain is in force.',
    section: '4.2.2 / 4.2.3',
    phases: [
      {
        label: 'Revocation',
        testVector: 'crev_step1',
        nmas: "Don't use",
        actions: [
          'NMA Status goes to "Don’t use" — do not authenticate navigation data.',
          'Discard the revoked chain (CID = i) immediately.',
          'Retrieve the new DSM-KROOT (CID = i′) and verify it with the current public key, ready for when it enters force.',
        ],
      },
      {
        label: 'New chain in force',
        testVector: 'crev_step2',
        nmas: 'Operational',
        actions: [
          'The new chain (CID = i′) enters into force and NMA Status reverses to Operational.',
          'Navigation data authentication resumes with the new chain. CPKS still reads Chain Revoked.',
        ],
      },
      {
        label: 'Back to nominal',
        testVector: 'crev_step3',
        nmas: 'Operational',
        actions: ['CPKS clears back to Nominal.'],
      },
    ],
  },
  {
    id: 'npk',
    abbr: 'NPK',
    name: 'New Public Key',
    cpks: 4,
    color: 'sig',
    summary: 'The signing public key is renewed. The new key is published and authenticated before it takes over.',
    section: '4.2.2',
    phases: [
      {
        label: 'New key broadcast',
        testVector: 'npk_step1',
        nmas: 'Operational',
        actions: [
          'A new public key (PKID = p′) is broadcast in a DSM-PKR.',
          'Retrieve and verify it against the Merkle root; keep using the current key (p) and chain.',
        ],
      },
      {
        label: 'New key in force',
        testVector: 'npk_step2',
        nmas: 'Operational',
        actions: [
          'The DSM-KROOT now references PKID = p′; verify KROOT signatures with the new key.',
          'Discard the old public key (p).',
        ],
      },
      {
        label: 'Back to nominal',
        testVector: 'npk_step3',
        nmas: 'Operational',
        actions: ['CPKS returns to Nominal with the new key in force.'],
      },
    ],
  },
  {
    id: 'pkrev',
    abbr: 'PKREV',
    name: 'Public Key Revoked',
    cpks: 5,
    color: 'bad',
    summary: 'A public key is revoked. Both a new key and a new chain are brought in, with authentication paused in between.',
    section: '4.2.2 / 4.2.3',
    phases: [
      {
        label: 'Revocation',
        testVector: 'pkrev_step1',
        nmas: "Don't use",
        actions: [
          'NMA Status goes to "Don’t use".',
          'The old key (p) is revoked; a new key (p′) is broadcast — retrieve and verify the new DSM-PKR.',
        ],
      },
      {
        label: 'New key and chain in force',
        testVector: 'pkrev_step2',
        nmas: 'Operational',
        actions: [
          'Verify the new DSM-KROOT (chain i′) with the new key (p′); discard the old key and chain.',
          'NMA Status returns to Operational; authenticate with the new chain.',
        ],
      },
      {
        label: 'Back to nominal',
        testVector: 'pkrev_step3',
        nmas: 'Operational',
        actions: ['CPKS clears back to Nominal.'],
      },
    ],
  },
  {
    id: 'nmt',
    abbr: 'NMT',
    name: 'New Merkle Tree',
    cpks: 6,
    color: 'hash',
    summary: 'The Merkle tree itself is renewed — a rare event needing a fresh root from the GSC server.',
    section: '4.2.2',
    phases: [
      {
        label: 'New root distributed',
        testVector: 'nmt_step1',
        nmas: 'Operational',
        actions: [
          'Download the new Merkle root out-of-band from the GSC OSNMA server.',
          'Keep using the current public key and chain, verified against the old root.',
        ],
      },
      {
        label: 'New tree in force',
        testVector: 'nmt_step2',
        nmas: 'Operational',
        actions: [
          'A new public key (p′) arrives in a DSM-PKR; verify it against the NEW root.',
          'Verify the DSM-KROOT with the new key; discard the old root and keys.',
        ],
      },
      {
        label: 'Back to nominal',
        testVector: 'nmt_step3',
        nmas: 'Operational',
        actions: ['CPKS returns to Nominal with the new tree in force.'],
      },
    ],
  },
  {
    id: 'oam',
    abbr: 'OAM',
    name: 'OSNMA Alert Message',
    cpks: 7,
    color: 'bad',
    summary: 'An authenticated alert: the service is compromised or disrupted. Discard everything and stop.',
    section: '4.2.3',
    phases: [
      {
        label: 'Alert raised',
        testVector: 'oam_step1',
        nmas: "Don't use",
        actions: [
          'Confirm the OAM via a DSM-PKR or DSM-KROOT.',
          'Discard ALL stored cryptographic material — Merkle root, public keys, KROOT and chain keys.',
          'Stop processing OSNMA data entirely.',
        ],
      },
      {
        label: 'Recovery',
        testVector: 'oam_step2',
        nmas: "Don't use",
        actions: [
          'By this step OSNMA transmission has stopped entirely (no NMA status is broadcast).',
          'Connect to the GSC OSNMA server for recovery instructions and fresh material.',
        ],
      },
    ],
  },
];
