import type { RefTable } from '@/data/types';

/** ADKD — Authentication Data and Key Delay (SIS ICD 4.2.1.3). */
export const ADKD_TABLE: RefTable = {
  id: 'adkd',
  title: 'ADKD — Authentication Data and Key Delay',
  cols: ['ADKD', 'Authenticated data', 'I/NAV word types', 'Key delay'],
  rows: [
    [0, 'Ephemeris, clock and status', 'WT 1-5', '1 subframe'],
    ['1-3', 'Reserved', '-', '-'],
    [4, 'Timing parameters', 'WT 6, 10', '1 subframe'],
    ['5-11', 'Reserved', '-', '-'],
    [12, 'Slow MAC: ephemeris, clock and status', 'WT 1-5', '11 subframes (+10)'],
    ['13-15', 'Reserved', '-', '-'],
  ],
  doc: 'icd',
  section: '4.2.1.3',
  caption: 'Which navigation data a tag authenticates, and how long until its key is disclosed.',
};

/** COP — Cut-Off Point (SIS ICD 4.2.1.2). */
export const COP_TABLE: RefTable = {
  id: 'cop',
  title: 'COP — Data Cut-Off Point',
  cols: ['Value', 'Meaning'],
  rows: [
    [0, 'Dummy tag (navdata replaced by zeros).'],
    ['1-15', 'Maximum tag-to-data lag T_COP = Δ_COP × COP (Δ_COP = one 30 s subframe).'],
  ],
  doc: 'icd',
  section: '4.2.1.2',
};

/** PRN_D — Data PRN (SIS ICD 4.2.1.1). */
export const PRN_D_TABLE: RefTable = {
  id: 'prn_d',
  title: 'PRN_D — Data PRN',
  cols: ['Value', 'Meaning'],
  rows: [
    [0, 'Reserved'],
    ['1-36', 'Galileo SVID of the satellite whose data is authenticated.'],
    ['37-254', 'Reserved'],
    [255, 'Galileo constellation-level information (not satellite-specific).'],
  ],
  doc: 'icd',
  section: '4.2.1.1',
  caption: 'PRN_D names the data source; PRN_A (1-36) names the satellite carrying the tag.',
};

/**
 * MACLT — a representative slice of the MAC Look-up Table (SIS ICD Annex C).
 * Notation: first two chars = ADKD (00, 04, 12); last char = S (self, same SV),
 * E (Galileo cross-auth, other SV); FLX = flexible slot (authenticated by MACSEQ).
 */
export const MACLT_TABLE: RefTable = {
  id: 'maclt',
  title: 'MACLT — example sequences (Annex C)',
  cols: ['ID', 'Tags', 'Sequence (subframe 1 / subframe 2)'],
  rows: [
    [27, 6, '00S 00E 00E 00E 12S 00E  /  00S 00E 00E 04S 12S 00E'],
    [31, 5, '00S 00E 00E 12S 00E  /  00S 00E 00E 12S 04S'],
    [33, 6, '00S 00E 04S 00E 12S 00E  /  00S 00E 00E 12S 00E 12E'],
    [34, 6, '00S FLX 04S FLX 12S 00E  /  00S FLX 00E 12S 00E 12E'],
    [37, 5, '00S 00E 04S 00E 12S  /  00S 00E 00E 12S 12E'],
    [40, 4, '00S 00E 04S 12S  /  00S 00E 00E 12E'],
  ],
  doc: 'icd',
  section: 'Annex C',
  highlightRow: 3,
  caption: 'The test vectors use MACLT = 34. The full table holds up to 256 sequences.',
};

export const MACK_TABLES = [ADKD_TABLE, COP_TABLE, PRN_D_TABLE, MACLT_TABLE];
