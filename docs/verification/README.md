# Verification

How this site's correctness is established **without relying on model judgment**. The goal is not an
unprovable "100% guaranteed" but a system where every claim is mechanically checked or human-traceable,
so an error is *caught* rather than trusted.

## The four pillars

1. **Authoritative ground truth — the official PDF.** `Galileo OSNMA SIS ICD v1.1` and
   `Receiver Guidelines v1.3` are the supreme authority, above the markdown conversions and above any
   third-party code. Contested values were read from the rendered PDF tables.

2. **Reference-implementation cross-check** — every value table and field layout in `src/data` was
   diffed against **OSNMAlib** (KU Leuven, EUPL-1.2, peer-reviewed). All differences were benign
   OSNMAlib supersets; the PDF confirmed the site. See `osnmalib-crosscheck.md`.

3. **End-to-end oracle** — OSNMAlib was run on the official EUSPA test vectors: **19/19 scenarios
   reproduced exactly**, independently confirming the field values, the crypto, and the lifecycle
   NMA-status transitions the site teaches. See `osnmalib-run.md`.

4. **Deterministic tests + traceable ledger** — `npm run test` enforces structural invariants (bit
   sums, table arithmetic), derived quantities, **citation existence against the real documents**, and
   link integrity. `claims-ledger.md` backs each load-bearing claim with a verbatim quote;
   `known-simplifications.md` lists the honest residual.

## Files

| File | What |
|---|---|
| `osnmalib-crosscheck.md` | WS2/WS0: site ↔ OSNMAlib diff, adjudicated against the PDF |
| `osnmalib-run.md` | WS3: running OSNMAlib on the official vectors (19/19) |
| `claims-ledger.md` | WS4: every claim → authority + verbatim quote + status |
| `known-simplifications.md` | Scope and deliberate simplifications |

## Reproduce

```bash
# Deterministic site checks (incl. citation-existence against the official docs):
npm run test          # 33 tests
npm run check         # astro type-check
npm run build

# Reference-implementation oracle (Python 3.10–3.12):
python -m venv venv
venv/Scripts/python -m pip install -r <osnmalib>/requirements.txt
# scripts/verify/run_osnmalib.py drives all 19 scenarios with a Windows-safe log path:
venv/Scripts/python scripts/verify/run_osnmalib.py   # -> "19/19 ... reproduced EXACTLY"
```

`scripts/verify/run_osnmalib.py` expects OSNMAlib at `C:\Personal\OSNMA_test_vector\osnmalib`
(edit the `LIB`/`TESTS` paths if it lives elsewhere).
