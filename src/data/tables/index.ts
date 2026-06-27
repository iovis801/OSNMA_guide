import type { RefTable } from '@/data/types';
import { CRYPTO_PARAM_TABLES } from './crypto-params';
import { HEADER_TABLES } from './header';
import { DSM_TABLES } from './dsm';
import { MACK_TABLES } from './mack';

export * from './crypto-params';
export * from './header';
export * from './dsm';
export * from './mack';

/** All value tables, grouped for the reference page. */
export const TABLE_GROUPS: { title: string; tables: RefTable[] }[] = [
  { title: 'NMA Header', tables: HEADER_TABLES },
  { title: 'Cryptographic parameters', tables: CRYPTO_PARAM_TABLES },
  { title: 'Digital Signature Messages', tables: DSM_TABLES },
  { title: 'MACK, tags and Tag-Info', tables: MACK_TABLES },
];

const ALL_TABLES: RefTable[] = TABLE_GROUPS.flatMap((g) => g.tables);

const TABLE_BY_ID = new Map(ALL_TABLES.map((t) => [t.id, t]));

export function getTable(id: string): RefTable | undefined {
  return TABLE_BY_ID.get(id);
}
