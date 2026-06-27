import type { RefTable } from '@/data/types';

/** NB_DK — Number of DSM-KROOT blocks (SIS ICD 3.2.3.1). */
export const NB_DK_TABLE: RefTable = {
  id: 'nb_dk',
  title: 'NB_DK — Number of DSM-KROOT blocks',
  cols: ['Value', 'Blocks', 'Total length l_DK (bits)'],
  rows: [
    [0, 'Reserved', '-'],
    [1, 7, 728],
    [2, 8, 832],
    [3, 9, 936],
    [4, 10, 1040],
    [5, 11, 1144],
    [6, 12, 1248],
    [7, 13, 1352],
    [8, 14, 1456],
    ['9-15', 'Reserved', '-'],
  ],
  doc: 'icd',
  section: '3.2.3.1',
  highlightRow: 2,
  caption: 'A DSM-KROOT is reassembled from this many 104-bit blocks.',
};

/** NB_DP — Number of DSM-PKR blocks (SIS ICD 3.2.2.1). */
export const NB_DP_TABLE: RefTable = {
  id: 'nb_dp',
  title: 'NB_DP — Number of DSM-PKR blocks',
  cols: ['Value', 'Blocks', 'Total length l_DP (bits)'],
  rows: [
    ['0-6', 'Reserved', '-'],
    [7, 13, 1352],
    [8, 14, 1456],
    [9, 15, 1560],
    [10, 16, 1664],
    ['11-15', 'Reserved', '-'],
  ],
  doc: 'icd',
  section: '3.2.2.1',
  highlightRow: 1,
};

/** NPKT — New Public Key Type (SIS ICD 3.2.2.4). */
export const NPKT_TABLE: RefTable = {
  id: 'npkt',
  title: 'NPKT — New Public Key Type',
  cols: ['Value', 'Type'],
  rows: [
    [0, 'Reserved'],
    [1, 'ECDSA P-256'],
    [2, 'Reserved'],
    [3, 'ECDSA P-521'],
    [4, 'OSNMA Alert Message (OAM)'],
    ['5-15', 'Reserved'],
  ],
  doc: 'icd',
  section: '3.2.2.4',
  highlightRow: 1,
};

/** MID — Message ID: leaf and intermediate nodes per leaf (SIS ICD 3.2.2.2). */
export const MID_TABLE: RefTable = {
  id: 'mid',
  title: 'MID — Merkle leaf and intermediate nodes',
  cols: ['MID', 'Leaf', 'Intermediate nodes (ITN)'],
  rows: [
    [0, 'm0', 'x0,1  x1,1  x2,1  x3,1'],
    [1, 'm1', 'x0,0  x1,1  x2,1  x3,1'],
    [2, 'm2', 'x0,3  x1,0  x2,1  x3,1'],
    [3, 'm3', 'x0,2  x1,0  x2,1  x3,1'],
    [4, 'm4', 'x0,5  x1,3  x2,0  x3,1'],
    [5, 'm5', 'x0,4  x1,3  x2,0  x3,1'],
    [6, 'm6', 'x0,7  x1,2  x2,0  x3,1'],
    [7, 'm7', 'x0,6  x1,2  x2,0  x3,1'],
    [8, 'm8', 'x0,9  x1,5  x2,3  x3,0'],
    [9, 'm9', 'x0,8  x1,5  x2,3  x3,0'],
    [10, 'm10', 'x0,11 x1,4  x2,3  x3,0'],
    [11, 'm11', 'x0,10 x1,4  x2,3  x3,0'],
    [12, 'm12', 'x0,13 x1,7  x2,2  x3,0'],
    [13, 'm13', 'x0,12 x1,7  x2,2  x3,0'],
    [14, 'm14', 'x0,15 x1,6  x2,2  x3,0'],
    [15, 'm15', 'x0,14 x1,6  x2,2  x3,0'],
  ],
  doc: 'icd',
  section: '3.2.2.2',
  highlightRow: 0,
  caption: 'Each DSM-PKR carries one leaf plus the four siblings needed to climb to the root.',
};

export const DSM_TABLES = [NB_DK_TABLE, NB_DP_TABLE, NPKT_TABLE, MID_TABLE];
