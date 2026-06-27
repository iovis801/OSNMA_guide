/**
 * Site navigation model — single source of truth for the sidebar, the landing
 * page section cards, and prev/next paging. Pages not yet built are marked
 * `ready: false` so the full information architecture stays visible while the
 * site is filled in incrementally.
 */
export interface NavItem {
  title: string;
  href: string;
  blurb?: string;
  ready?: boolean;
}

export interface NavSection {
  id: string;
  title: string;
  blurb: string;
  items: NavItem[];
}

export const NAV: NavSection[] = [
  {
    id: 'orientation',
    title: '0 · Orientation',
    blurb: 'The big picture: what OSNMA is and the problem it solves.',
    items: [
      { title: 'What is OSNMA?', href: '/', blurb: 'The chain of trust at a glance.', ready: true },
      { title: 'The spoofing problem', href: '/foundations/spoofing', blurb: 'Why GNSS needs authentication.', ready: true },
    ],
  },
  {
    id: 'foundations',
    title: '1 · Cryptographic foundations',
    blurb: 'The primitives OSNMA is built from.',
    items: [
      { title: 'Crypto primer', href: '/foundations/crypto-primer', blurb: 'Hashes, MACs, signatures, one-way chains, Merkle trees.', ready: true },
      { title: 'The TESLA idea', href: '/foundations/tesla', blurb: 'Authentication through delayed key disclosure.', ready: true },
    ],
  },
  {
    id: 'signal',
    title: '2 · OSNMA on the signal',
    blurb: 'Where the authentication bits live in the Galileo message.',
    items: [
      { title: 'E1-B page, HKROOT & MACK', href: '/signal/structure', blurb: 'The 40-bit OSNMA field and the 30 s subframe.', ready: true},
      { title: 'Galileo System Time (GST)', href: '/signal/gst', blurb: 'WN, TOW and the subframe clock.', ready: true },
      { title: 'Cross-authentication', href: '/signal/constellation', blurb: 'A moving OSNMA subset; self- and cross-auth.', ready: true },
    ],
  },
  {
    id: 'structures',
    title: '3 · Data structures',
    blurb: 'Every field, bit by bit.',
    items: [
      { title: 'NMA Header', href: '/structures/nma-header', blurb: 'NMAS, CID, CPKS.', ready: true },
      { title: 'DSM-KROOT', href: '/structures/dsm-kroot', blurb: 'The signed TESLA root key.', ready: true },
      { title: 'DSM-PKR', href: '/structures/dsm-pkr', blurb: 'Public key renewal via Merkle tree.', ready: true},
      { title: 'MACK message', href: '/structures/mack', blurb: 'Tags, Tag-Info and the disclosed key.', ready: true},
      { title: 'MAC Look-up Table', href: '/structures/maclt', blurb: 'Tag sequences and flexible slots.', ready: true},
    ],
  },
  {
    id: 'machinery',
    title: '4 · Cryptographic machinery',
    blurb: 'How the protocol actually computes trust.',
    items: [
      { title: 'TESLA key chain', href: '/machinery/tesla-chain', blurb: 'Generation, disclosure and verification.', ready: true },
      { title: 'Merkle tree explorer', href: '/machinery/merkle-tree', blurb: 'Authenticating public keys (real data).', ready: true },
      { title: 'The chain of trust', href: '/machinery/chain-of-trust', blurb: 'Root to navigation data, end to end.', ready: true },
    ],
  },
  {
    id: 'receiver',
    title: '5 · The receiver',
    blurb: 'What a receiver does when it wakes up.',
    items: [
      { title: 'Signal to first fix', href: '/receiver/first-fix', blurb: 'Words, packets and the path to an authenticated fix.', ready: true },
      { title: 'Cold / warm / hot start', href: '/receiver/startup', blurb: 'Powering on after a variable time off.', ready: true },
      { title: 'Time synchronisation gate', href: '/receiver/time-sync', blurb: 'The security check before any tag is trusted.', ready: true },
    ],
  },
  {
    id: 'lifecycle',
    title: '6 · Key & lifecycle management',
    blurb: 'Renewals, revocations and alerts.',
    items: [
      { title: 'Status & lifecycle events', href: '/lifecycle/events', blurb: 'EOC, CREV, NPK, PKREV, NMT, OAM.', ready: true},
    ],
  },
  {
    id: 'reference',
    title: '7 · Reference',
    blurb: 'Tables, glossary and sources.',
    items: [
      { title: 'Parameter reference', href: '/reference/parameters', blurb: 'All the value tables in one place.', ready: true},
      { title: 'Glossary', href: '/reference/glossary', blurb: 'Every acronym, defined.', ready: true},
      { title: 'Sources', href: '/reference/sources', blurb: 'The official documents this site cites.', ready: true },
    ],
  },
];

/** Flat list of ready pages in reading order, for prev/next navigation. */
export const READING_ORDER: NavItem[] = NAV.flatMap((s) => s.items).filter((i) => i.ready);
