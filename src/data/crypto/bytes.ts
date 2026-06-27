import { bytesToHex, hexToBytes, concatBytes } from '@noble/hashes/utils';

export { bytesToHex, hexToBytes, concatBytes };

/** Strip whitespace and colons and lowercase a hex string. */
export function cleanHex(s: string): string {
  return s.replace(/[\s:]/g, '').toLowerCase();
}

/** Group a hex string into space-separated chunks (default byte pairs) for display. */
export function groupHex(hex: string, group = 2): string {
  const clean = cleanHex(hex).toUpperCase();
  return clean.replace(new RegExp(`(.{${group}})`, 'g'), '$1 ').trim();
}

/** Shorten a long hex string to `head…tail` for compact display. */
export function shortHex(hex: string, head = 8, tail = 6): string {
  const clean = cleanHex(hex).toUpperCase();
  if (clean.length <= head + tail + 1) return clean;
  return `${clean.slice(0, head)}…${clean.slice(-tail)}`;
}
