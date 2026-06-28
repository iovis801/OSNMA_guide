# OSNMAlib ↔ site cross-check (WS2) and PDF adjudication (WS0)

**Method.** Every value table and bit-field layout in `src/data` was compared against the
independent reference implementation **OSNMAlib** (KU Leuven, EUPL-1.2, `C:\Personal\OSNMA_test_vector\osnmalib\`).
Each difference was then adjudicated against the **supreme authority — the official PDF**
`Galileo_OSNMA_SIS_ICD_v1.1.pdf` (text + rendered table images), not the markdown. The PDF decides.

**Result: 4 differences found, all adjudicated → site is correct; OSNMAlib uses superset/extended
tables. Zero corrections to `src/data` required.**

| # | Item | Site (src/data) | OSNMAlib | PDF (authority) | Verdict |
|---|------|-----------------|----------|-----------------|---------|
| 1 | TS table 0–4 | Reserved | 10/12/14/16/18 bits | **Table 11: 0–4 Reserved**, 5→20, 6→24, 7→28, 8→32, 9→40, 10–15 Reserved | Site correct; OSNMAlib superset |
| 2 | HF = 1 | Reserved | SHA3-224 | **Table 8: 0 SHA-256, 1 Reserved, 2 SHA3-256, 3 Reserved** | Site correct; OSNMAlib superset |
| 3 | NB_DP = 5 | Reserved (0–6) | valid, 11 blocks / 1144 b | **Table 3: 0–6 Reserved**, 7→13/1352, 8→14/1456, 9→15/1560, 10→16/1664, 11–15 Reserved | Site correct; OSNMAlib superset |
| 4 | DSM-KROOT 2b after CIDKR (+4b after MACLT) | Reserved1 (2) / Reserved2 (4) | NMACK (2) / KROOT_R+MO (4) | §3.2.3: header = "NBDK, PKID, CIDKR, **Reserved1**, HF, MF, KS, TS, MACLT, **Reserved2**, WNK, TOWHK, α … Reserved1 and Reserved2 … reserved for future use" | Site correct; OSNMAlib extended |

OSNMAlib is intentionally a permissive parser (it ingests multiple ICD revisions / configurations),
so it carries values the OS SIS ICD v1.1 reserves. That is expected and does not indicate a site error.

## Values confirmed to AGREE across site + OSNMAlib + PDF

Directly confirmed in the PDF during this pass (verbatim quotes captured in the claims ledger):
- **HF** Table 8, **MF** Table 9, **KS** Table 10, **TS** Table 11, **NB_DP** Table 3, **MID** Table 4
  (m0 → x0,1 x1,1 x2,1 x3,1).
- **DSM-KROOT** fixed-header field list + 104-bit total + length formula
  `l_DK = 104·⌈1+(l_K+l_DS)/104⌉` (§3.2.3); **DSM-PKR** length formula
  `l_DP = 104·⌈(1040+l_NPK)/104⌉` (§3.2.2).
- **MACK header**: COP is "a 4-bit field" (§4.1.3); **MACSEQ** is "a 12-bit field" (§4.1.2).
- **hash_chain** "is the specific hash function used for the TESLA chain as indicated in the HF
  field" (§6.1.1) — confirms HF governs the chain only (our HF-scope fix is correct).

Confirmed equal between site and OSNMAlib (and consistent with the markdown the auditors checked;
PDF quotes to be attached in the ledger): KS 96–256, NB_DK 1→7…8→14 / 728–1456, NPKT (1 P-256,
3 P-521, 4 OAM), NPK 264/536, ADKD (0=WT1-5/549b, 4=WT6,10/141b, 12=WT1-5/+11 subframes),
α = 48 bits, GST = WN(12)+TOW(20), key index I = (GST_SF−GST_0)/30 **+ 1** with KROOT at GST_0−30,
chain derivation `K_i = trunc(l_k, hash(K_{i+1} ‖ GST_{SF,i} ‖ α))` with the **output** key's GST,
Merkle leaf `NPKT‖NPKID‖NPK` and parity-ordered node hashing, Tag/Tag0/MACSEQ message constructions
(Tag0 omits PRN_D).

## Bottom line

The two pass-2 fixes that OSNMAlib was used to double-check (output-key GST binding; key index +1)
are confirmed by the reference implementation. Every OSNMAlib↔site difference is a benign OSNMAlib
superset, and the authoritative PDF confirms the site. **No `src/data` changes result from WS2.**
