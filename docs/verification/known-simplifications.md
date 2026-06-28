# Known simplifications & scope

This site is an **educational explainer**, not the authoritative specification. It is built on, and
verified against, the **Galileo OSNMA SIS ICD v1.1** (Oct 2023) and the **Receiver Guidelines v1.3**
(Jan 2024). The authoritative documents always take precedence.

Deliberate simplifications, each chosen for teaching clarity and flagged here for honesty:

- **Minimum tag length L_t^min / tag accumulation.** OS SIS ICD v1.1 does not fix L_t^min (it is
  deferred to the future Service Definition Document). The site says "a verified tag authenticates the
  data" without the accumulation caveat. With the 40-bit tags of the test vectors this is effectively
  true, but a fully rigorous receiver accumulates tag bits to a minimum strength (RxG §5.5.6).

- **Illustrative start-up renewal thresholds.** The receiver start-up explorer uses illustrative
  times for when a cached chain / key / Merkle tree goes stale (≈1 day / ≈1 year / ≈10 years). Only
  the *ordering* is spec-grounded (Merkle-tree renewal "typically after more than 10 years"); the exact
  numbers are operational parameters, labelled illustrative in the UI.

- **Demo data set.** The Merkle Tree Explorer uses the real `Merkle_tree_1` / PKID 1 material; some
  DSM examples reference the tree-2 / MACLT-34 configuration. Both are official EUSPA test vectors.

- **Formula brevity.** A few formulas omit the trailing zero-padding term `P` except where it is
  load-bearing (the tag and DSM examples show it).

- **Version scope.** Later ICD revisions may add or change values. Example: OSNMAlib (a permissive,
  multi-version parser) defines TS 0–4, HF=1 and NB_DP=5 that OS SIS ICD v1.1 **reserves**; the site
  follows v1.1 (confirmed against the PDF — see `osnmalib-crosscheck.md`).

## What "verified" means here

See `README.md` in this folder. In short: every quantitative fact is checked by a deterministic test
or cross-checked against the OSNMAlib reference implementation and the official test vectors, and every
cited section is mechanically confirmed to exist in the official documents. The `claims-ledger.md`
backs each load-bearing claim with a verbatim quote. Two items (the L_t^min simplification and the
time-sync threat-direction wording) are flagged for human-SME confirmation.
