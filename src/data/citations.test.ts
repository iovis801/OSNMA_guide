import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { NAV } from '@/data/nav';

/**
 * Citation-existence + link-integrity invariants (WS1). Mechanically catches
 * fabricated/wrong section numbers and dead internal links — failure modes an
 * LLM can introduce but cannot self-detect by reading prose.
 *
 * The citation check reads the official reference documents (markdown) on this
 * machine; if they are absent (e.g. CI on another host) it skips rather than fail.
 */
const ROOT = process.cwd();
const SRC = path.join(ROOT, 'src');
const REF = 'C:/Personal/OSNMA_test_vector/ref';
const ICD = path.join(REF, 'Galileo_OSNMA_SIS_ICD_v1_1.md');
const RXG = path.join(REF, 'Galileo_OSNMA_Receiver_Guidelines_v1_3.md');

function walk(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const p = path.join(dir, d.name);
    return d.isDirectory() ? walk(p) : [p];
  });
}

const srcFiles = walk(SRC).filter((f) => /\.(astro|tsx|ts)$/.test(f) && !f.endsWith('.test.ts'));

/** Every cited section token (DocRef/Cite props and data `section:` literals). */
function collectSectionTokens(): { token: string; file: string }[] {
  const out: { token: string; file: string }[] = [];
  const re = /\bsection\s*[:=]\s*["']([^"']+)["']/g;
  for (const f of srcFiles) {
    const txt = fs.readFileSync(f, 'utf8');
    let m: RegExpExecArray | null;
    while ((m = re.exec(txt))) {
      for (const tok of m[1].split('/').map((s) => s.trim()).filter(Boolean)) {
        out.push({ token: tok, file: path.relative(ROOT, f) });
      }
    }
  }
  return out;
}

const haveDocs = fs.existsSync(ICD) && fs.existsSync(RXG);

describe.skipIf(!haveDocs)('citation existence (against official docs)', () => {
  const docText = haveDocs ? fs.readFileSync(ICD, 'utf8') + '\n' + fs.readFileSync(RXG, 'utf8') : '';
  const tokens = collectSectionTokens();

  it('collected a non-trivial set of citations', () => {
    expect(tokens.length).toBeGreaterThan(20);
  });

  it('every cited section/annex appears in an official document', () => {
    const missing = tokens.filter(({ token }) => !docText.includes(token));
    expect(missing, `unknown citations: ${JSON.stringify(missing)}`).toEqual([]);
  });
});

describe('internal link / nav integrity', () => {
  function pageExists(href: string): boolean {
    if (href === '/') return fs.existsSync(path.join(SRC, 'pages', 'index.astro'));
    const rel = href.replace(/^\//, '').replace(/\/$/, '');
    return (
      fs.existsSync(path.join(SRC, 'pages', `${rel}.astro`)) ||
      fs.existsSync(path.join(SRC, 'pages', rel, 'index.astro'))
    );
  }

  it('every nav item marked ready maps to a page file', () => {
    const broken = NAV.flatMap((s) => s.items)
      .filter((i) => i.ready)
      .filter((i) => !pageExists(i.href));
    expect(broken, `nav hrefs without a page: ${JSON.stringify(broken.map((b) => b.href))}`).toEqual([]);
  });

  it('every internal withBase("/...") link points to a real page', () => {
    const linkRe = /withBase\(\s*["'](\/[^"'#]*)["']\s*\)/g;
    const broken: string[] = [];
    for (const f of srcFiles) {
      const txt = fs.readFileSync(f, 'utf8');
      let m: RegExpExecArray | null;
      while ((m = linkRe.exec(txt))) {
        const href = m[1];
        if (href.startsWith('/reference/sources') || href.startsWith('/favicon')) continue;
        if (!pageExists(href)) broken.push(`${path.relative(ROOT, f)} -> ${href}`);
      }
    }
    expect(broken, `dead internal links: ${JSON.stringify(broken)}`).toEqual([]);
  });
});
