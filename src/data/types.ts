/** Shared types for the protocol data layer (value tables + bit-field specs). */

export type DocId = 'icd' | 'rxg';

/** A value lookup table (e.g. Key Size, ADKD), rendered by <ValueTable>. */
export interface RefTable {
  id: string;
  title: string;
  cols: string[];
  rows: (string | number)[][];
  doc: DocId;
  section: string;
  caption?: string;
  /** Optional row index to visually flag the value used in the test vectors. */
  highlightRow?: number;
}

/** One field within a bit-level message layout. */
export interface BitFieldEntry {
  name: string;
  /** Bit width, or 'var' for variable-length fields. */
  bits: number | 'var';
  abbr?: string;
  desc: string;
  /** Semantic colour key from the design tokens (key, tag, sig, hash, brand). */
  color?: 'brand' | 'key' | 'tag' | 'sig' | 'hash' | 'muted';
  /** Optional id of a RefTable that decodes this field's values. */
  tableId?: string;
  /** Example value (hex/binary) from the test vectors, if any. */
  example?: string;
}

/** A complete message layout, rendered by <BitField>. */
export interface BitFieldSpec {
  id: string;
  title: string;
  totalBits: string; // string because several are variable/derived
  doc: DocId;
  section: string;
  summary: string;
  fields: BitFieldEntry[];
}
