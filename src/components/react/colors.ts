/** Map semantic colour tokens to CSS custom properties (shared by React islands). */
export type ColorToken = 'brand' | 'key' | 'tag' | 'sig' | 'hash' | 'muted' | 'ok' | 'warn' | 'bad';

export function colorVar(token: ColorToken | undefined): string {
  return `var(--color-${token ?? 'brand'})`;
}
