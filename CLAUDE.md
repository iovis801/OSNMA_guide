# OSNMA Guide — project guide for Claude

An interactive educational website that explains Galileo **OSNMA** (Open Service
Navigation Message Authentication) exhaustively: the cryptographic principles, the
exact bits on the signal, and what a receiver does step by step. Technical but
approachable, with diagrams and animations. Content is in **English**.

## Authoritative sources (ground everything in these)

The official documents live **outside this repo** at `C:\Personal\OSNMA_test_vector\ref\`:
- `Galileo_OSNMA_SIS_ICD_v1_1.md` — Signal-in-Space ICD (bit-level protocol).
- `Galileo_OSNMA_Receiver_Guidelines_v1_3.md` — receiver processing, start-up, lifecycle.
- `Test_vectors\...` — official EUSPA test vectors (real Merkle trees, public keys, DSMs, I/NAV CSVs).

Every non-trivial claim must cite the source with `DocRef`/`Cite` (`doc="icd"` = SIS
ICD v1.1, `doc="rxg"` = Receiver Guidelines v1.3). Do not invent protocol facts; if
something isn't in the docs, label it illustrative (see the start-up time thresholds).

## Stack & commands

Astro 5 + React 19 islands + TailwindCSS v4 + Framer Motion (`motion/react`) + KaTeX +
`@noble/hashes`/`@noble/curves` (real crypto). Vitest for unit tests.

```
npm run dev      # local dev server
npm run build    # static build -> dist/
npm run check    # astro check (type-check) — must be 0 errors/warnings/hints
npm run test     # vitest — crypto + receiver-model unit tests
```

Verification gate before commit: `npm run check` clean, `npm run build` succeeds,
`npm run test` green. The crypto test reproduces the **real** EUSPA Merkle root
`0E63F552…` from `src/data/testvectors/merkle-tree-1.ts` — if it ever fails, the
crypto is wrong, not the test.

## Repository map

- `src/data/` — single source of truth (typed):
  - `nav.ts` — site navigation; flip `ready: true` when a page is built.
  - `fields/` — bit-field layouts (`BitFieldSpec`) for `BitField`.
  - `tables/` — value lookup tables (`RefTable`) + `TABLE_GROUPS`, `getTable(id)`.
  - `testvectors/` — real EUSPA data (Merkle tree 1).
  - `crypto/` — `bytes`, `hash`, `merkle`, `tesla` (verified against test vectors).
  - `glossary.ts`, `lifecycle.ts`, `inav-words.ts`.
- `src/components/ui/` — Astro components: `PageHeader`, `ValueTable`, `Formula`,
  `DocRef`, `Callout`.
- `src/components/react/` — React islands (animations/interactives): `BitField`,
  `Stepper` (`useStepper` + `StepControls`), `Cite`, `colors`, and the flagships
  (`startup/ReceiverStartup`, `TeslaChain`, `MerkleTreeExplorer`, `ChainOfTrust`,
  `TimeSyncGate`, `SubframeBuilder`, `GstClock`, `FirstFixTimeline`, `DsmReassembly`,
  `ConstellationCrossAuth`, `AnimatedChainPreview`).
- `src/pages/` — one folder per nav section (orientation, foundations, signal,
  structures, machinery, receiver, lifecycle, reference) + `404.astro`.
- `src/layouts/BaseLayout.astro`, `src/styles/global.css`.

## Conventions

- **No emojis** in code/comments. Immutable style. Many small focused files.
- **Semantic colours** (CSS vars in `global.css`, reused across diagrams so readers
  build a colour map): `brand` chrome, `key` TESLA keys (gold), `tag` tags/MACs
  (cyan), `sig` signatures (violet), `hash` Merkle/hashes (green), `ok/warn/bad`.
- **Beginner ⇄ Engineer** layering: display `Formula` and `ValueTable` are
  auto-gated `.level-engineer` (hidden in Beginner). Use `<ValueTable always />` to
  keep a table visible to beginners (the parameter reference does this). Wrap
  engineer-only prose in `<div class="level-engineer">…</div>`. A `.level-beginner`
  banner in `BaseLayout` tells beginners what's hidden.
- **New page pattern**: `BaseLayout` → `PageHeader` (eyebrow = section title) →
  prose `h2/p` (auto-styled by `.prose-osnma`) → components. React islands use
  `client:visible`. Then set `ready: true` in `nav.ts`.
- React islands can't use Astro components — use the React `Cite` instead of `DocRef`.

## Status

Phases 1–2 plus a didactic round are done: 23 pages, every nav entry ready, all
flagships built, on GitHub at `https://github.com/iovis801/OSNMA_guide` (branch
`main`). Conventional commits; commit/push only when asked. The local repo git
identity is set per-repo (iovis801 / loki.startup@gmail.com); `gh` is authed.

## Backlog / TODO

- **Live raw I/NAV decoding (deferred — low priority).** Decode the raw 432000-bit
  I/NAV hex from the test-vector CSVs (`Test_vectors\...\osnma_test_vectors\*.csv`)
  in the browser to extract live OSNMA bits and drive a real byte-level
  authentication walkthrough (real DSM-KROOT fields, real tags/keys). Deferred:
  high effort, and the existing illustrative + real-Merkle demos already teach the
  concepts well. Revisit only if a fully "real data everywhere" walkthrough is wanted.
- Optional polish ideas if revisited: a searchable parameter filter, an E2E smoke
  test (Playwright) once a browser bridge is available, deploy config for a chosen host.
