/**
 * Base-path helpers for deploying the guide under a sub-path (e.g. `/osnma`).
 *
 * Astro does NOT auto-prefix string `href`/`src` values with the configured
 * `base`. `import.meta.env.BASE_URL` holds that base (e.g. `'/osnma/'`), so any
 * absolute in-app path rendered as a string must be passed through `withBase()`.
 * Astro-managed assets (imported images, bundled CSS/JS, `<Image>`) already get
 * the base applied — do NOT wrap those.
 */

/** The configured base, without a trailing slash. `''` when deployed at root. */
const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

/**
 * Prefix an absolute in-app path with the configured base, avoiding a double
 * slash. `withBase('/foundations/spoofing')` -> `'/osnma/foundations/spoofing'`;
 * `withBase('/')` -> `'/osnma/'`.
 */
export function withBase(href: string): string {
  const path = href.startsWith('/') ? href : `/${href}`;
  return `${BASE}${path}`;
}

/**
 * Remove the configured base from a runtime pathname (e.g. `Astro.url.pathname`)
 * so it can be compared against the unprefixed hrefs in `nav.ts`. Trailing
 * slashes are normalised away (except for the root, which stays `'/'`).
 * `stripBase('/osnma/foundations/spoofing/')` -> `'/foundations/spoofing'`.
 */
export function stripBase(pathname: string): string {
  let path = pathname;
  if (BASE && path.startsWith(BASE)) {
    path = path.slice(BASE.length) || '/';
  }
  if (path.length > 1) path = path.replace(/\/$/, '');
  return path || '/';
}
