# WS3 — OSNMAlib run on the official EUSPA test vectors (end-to-end oracle)

**What was run.** OSNMAlib (KU Leuven reference receiver, EUPL-1.2) was installed in an isolated
venv (Python 3.12.11, deps from `osnmalib/requirements.txt`) and executed against the official
EUSPA OSNMA test vectors shipped with it (`osnmalib/tests/icd_test_vectors/`, the same vectors as
`ref/Test_vectors/.../osnma_test_vectors/`). The library's own assertions check exact counts of
authenticated tags, authenticated navigation-data sets, authenticated KROOTs, and the per-subframe
NMA-status — for all 19 scenarios.

A tiny wrapper (`scratchpad/run_osnmalib.py`) was used only to fix a Windows path bug in the test
harness's log-file lookup (`rpartition('/')` assumes Unix separators); the receiver logic and the
assertions are unchanged.

**Result: 19 / 19 scenarios reproduced EXACTLY.**

```
PASS  configuration_1 / configuration_2 / configuration_2_pubk_kroot
PASS  eoc_step1 / eoc_step2
PASS  crev_step1 / crev_step2 / crev_step3
PASS  npk_step1 / npk_step2 / npk_step3
PASS  pkrev_step1 / pkrev_step2 / pkrev_step3
PASS  nmt_step1 / nmt_step2 / nmt_step3
PASS  oam_step1 / oam_step2
=== 19/19 official scenarios reproduced EXACTLY by OSNMAlib ===
```

## Why this verifies the site

Each scenario authenticates the real signal **and** the harness asserts the exact NMA-status
breakdown per subframe, which independently confirms the site's lifecycle model (`src/data/lifecycle.ts`):

| Scenario | tags / data / KROOT auth | NMAS op/test/dnu | Confirms on the site |
|---|---|---|---|
| configuration_1 (nominal) | 12532 / 6144 / 176 | 0 / 118 / 0 | NMAS = **Test** in the nominal test vector |
| crev_step1 | 6600 / 3120 / 233 | 60 / 0 / **59** | CREV step 1 → **Don't Use** |
| crev_step2 | 6547 / 3095 / 123 | **59** / 0 / 60 | CREV step 2 → reverses to **Operational** (the pass-1 bug we fixed) |
| crev_step3 | 13601 / 6514 / 198 | 116 / 0 / 0 | CREV step 3 → fully Operational |
| oam_step1 | 6549 / 3096 / 109 | 61 / 0 / 58 | OAM step 1 → drops to Don't Use |
| oam_step2 | **0** / 0 / 1 | 0 / 0 / **119** | OAM step 2 → service stopped, all Don't Use, no tags |

EOC / NPK / NMT scenarios show **no** Don't-Use subframes (renewals stay Operational) — also matching
the site's classification of those as continuity events.

## Crypto cross-check

- Our `src/data/crypto` reproduces the **real** Merkle root `0E63F552…` from the official
  `Merkle_tree_1` material (asserted in `src/data/crypto/crypto.test.ts`); OSNMAlib reproduces the
  same roots when it authenticates the vectors. Two independent implementations agree on real data.
- The TESLA chain derivation, tag/Tag0 message construction, key-index `+1`, and output-key GST
  binding in our crypto match OSNMAlib's `osnma_core/tesla_chain.py` and `structures/mack_structures.py`
  symbol-for-symbol (see `osnmalib-crosscheck.md`).

## Reproduce

```
python -m venv venv && venv/Scripts/python -m pip install -r <osnmalib>/requirements.txt
# from <osnmalib>/tests, with a Windows-safe status_log path:
python run_osnmalib.py    # prints "19/19 official scenarios reproduced EXACTLY"
```
