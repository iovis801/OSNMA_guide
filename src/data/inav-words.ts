/**
 * Galileo E1-B I/NAV word types relevant to obtaining a position fix and to
 * OSNMA authentication. (Galileo OS SIS ICD; ADKD mapping per OSNMA SIS ICD 4.2.1.3.)
 * `neededForFix` marks the words a receiver must decode before it can compute a
 * single-satellite position; `adkd` is the OSNMA tag type that authenticates it.
 */
export interface INavWord {
  wt: string;
  name: string;
  carries: string;
  neededForFix: boolean;
  adkd?: number;
}

export const INAV_WORDS: INavWord[] = [
  { wt: 'WT 1', name: 'Ephemeris (1/4)', carries: 'Orbit parameters, part 1', neededForFix: true, adkd: 0 },
  { wt: 'WT 2', name: 'Ephemeris (2/4)', carries: 'Orbit parameters, part 2', neededForFix: true, adkd: 0 },
  { wt: 'WT 3', name: 'Ephemeris (3/4) + SISA', carries: 'Orbit parameters, part 3, accuracy', neededForFix: true, adkd: 0 },
  { wt: 'WT 4', name: 'Ephemeris (4/4) + clock', carries: 'Orbit part 4, satellite clock correction', neededForFix: true, adkd: 0 },
  { wt: 'WT 5', name: 'Ionosphere, BGD, health, GST', carries: 'Iono correction, group delay, signal health, system time', neededForFix: true, adkd: 0 },
  { wt: 'WT 6', name: 'GST-UTC conversion', carries: 'Conversion to UTC', neededForFix: false, adkd: 4 },
  { wt: 'WT 10', name: 'GST-GPS conversion', carries: 'Conversion to GPS time', neededForFix: false, adkd: 4 },
  { wt: 'WT 0', name: 'Time / spare', carries: 'Time field and synchronisation (GST also comes from WT 5)', neededForFix: false },
  { wt: 'WT 7-9', name: 'Almanac', carries: 'Coarse orbit data for all satellites', neededForFix: false },
];

/** The minimal set a receiver must collect for a single-satellite position. */
export const FIX_REQUIRED = INAV_WORDS.filter((w) => w.neededForFix);
