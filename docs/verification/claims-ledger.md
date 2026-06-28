# Claims ledger (WS4)

Every load-bearing claim on the site, traced to an authority. **Authority** is one of:
- **PDF** — a verbatim quote from the official `Galileo OSNMA SIS ICD v1.1` (ICD) or
  `Receiver Guidelines v1.3` (RxG). Quotes are short excerpts; consult the documents for context.
- **OSNMAlib** — confirmed by the reference implementation reproducing the official test vectors
  (see `osnmalib-run.md`: 19/19 scenarios exact).
- **Test** — enforced by a deterministic unit test (`src/data/invariants.test.ts`,
  `crypto/crypto.test.ts`, `citations.test.ts`).

Status: **V** verified · **D** derived (reasoning from a cited principle) · **R** residual (human SME advised).
Table values that render as images in the PDF were read from the rendered table page and re-confirmed
against OSNMAlib + the deterministic tests.

## Value tables (ICD §3–4)

| Claim (site) | Authority | Verbatim / evidence | St |
|---|---|---|---|
| HF: 0 SHA-256, 1 Reserved, 2 SHA3-256, 3 Reserved | ICD §3.2.3.4 Table 8 | "HF value … 0 SHA-256 / 1 Reserved / 2 SHA3-256 / 3 Reserved" (rendered) | V |
| MF: 0 HMAC-SHA-256, 1 CMAC-AES, 2/3 Reserved | ICD §3.2.3.5 Table 9 | "0 HMAC-SHA-256 / 1 CMAC-AES / 2 Reserved / 3 Reserved" | V |
| KS: 0→96 … 8→256, 9–15 Reserved | ICD §3.2.3.6 Table 10 | rendered Table 10 (0/96 … 8/256; 9-15 Reserved) | V |
| TS: 0–4 Reserved, 5→20 … 9→40, 10–15 Reserved | ICD §3.2.3.7 Table 11 | rendered Table 11 (0-4 Reserved; 5/20,6/24,7/28,8/32,9/40) | V |
| NB_DP: 0–6 Reserved, 7→13/1352 … 10→16/1664 | ICD §3.2.2.1 Table 3 | rendered Table 3 (0-6 Reserved; 7/13/1352 … 10/16/1664) | V |
| NB_DK: 1→7/728 … 8→14/1456 | ICD §3.2.3.1 Table 7 | blocks×104=length (Test) + OSNMAlib | V |
| NPKT: 1 P-256, 3 P-521, 4 OAM | ICD §3.2.2.4 Table 5 | OSNMAlib enum + reproduces NPK/PKREV/NMT vectors | V |
| MID: m0 → x0,1 x1,1 x2,1 x3,1 (etc.) | ICD §3.2.2.2 Table 4 | rendered Table 4; Merkle demo reproduces real root (Test) | V |
| ADKD: 0=WT1-5, 4=WT6/10, 12=Slow MAC (+10 sf) | ICD §4.2.1.2 Table 14 | OSNMAlib ADKD masks; reproduces per-ADKD auth counts | V |
| NMAS: 1 Test, 2 Operational, 3 Don't use | ICD §3.1.1 / RxG §4.2.1 | "'Don't Use', to indicate that the receiver shall not perform navigation data authentication" | V |
| CPKS: 1 Nominal … 7 Alert Message | ICD §3.1.3 Table 2 | OSNMAlib status_log cpks transitions across the 19 scenarios | V |

## Bit-field layouts (ICD §3–4)

| Claim | Authority | Verbatim / evidence | St |
|---|---|---|---|
| DSM-KROOT fixed header = 104 bits (NB_DK,PKID,CIDKR,Reserved1,HF,MF,KS,TS,MACLT,Reserved2,WN_K,TOWH_K,α) | ICD §3.2.3 | "104 is the total size in bits of all the other fields within the DSM-KROOT (NBDK, PKID, CIDKR, Reserved1, HF, MF, KS, TS, MACLT, Reserved2, WNK, TOWHK, α)" | V |
| DSM-PKR pre-NPK = 1040 bits; l_DP = 104⌈(1040+l_NPK)/104⌉ | ICD §3.2.2 | "l_DP = 104 ⌈(1040 + l_NPK)/104⌉ … 1040 is the size in bits of all the other fields within the DSM-PKR" | V |
| MACK message = 480 bits / 30 s | ICD §4 | "The MACK message is 480 bits long and is transmitted once every 30 seconds" | V |
| MACSEQ = 12-bit field | ICD §4.1.2 | "MACSEQ is a 12-bit field that allows the receiver to authenticate the Tag-Info field for the tags whose ADKD type is identified as flexible" | V |
| COP = 4-bit field in MACK header | ICD §4.1.3 | "The COP is a 4-bit field that encodes the Data Cut-Off Point parameter" | V |
| n_t = ⌊(480 − l_K)/(l_t + 16)⌋ | ICD §4.2 | "The number of tags per MACK message n_t … = ⌊(480 − l_K)/(l_t + 16)⌋" | V |
| α = 48-bit random pattern | ICD §3.2.3.10 | "The 48-bit α field includes the random pattern to be included in the hashing process of the chain" | V |
| Structural sums (header 104, MACK 480, page 120, Tag-Info 16, DSM-PKR 1040; block alignment) | Test | `invariants.test.ts` (17 assertions) | V |

## Cryptography (ICD §6 / RxG §5)

| Claim | Authority | Verbatim / evidence | St |
|---|---|---|---|
| hash_chain (and thus HF) governs the TESLA chain only | ICD §6.1.1 | "hashchain(m) is the specific hash function used for the TESLA chain as indicated in the HF field of the DSM-KROOT" | V |
| KROOT = K0, sits at GST_0 − 30 s, never used for tags | ICD §5.5 / RxG A.4 | "KROOT is the key immediately preceding the first key of the chain and is nominally associated with the sub-frame starting at GST0 − 30 sec" | V |
| Key index I = (GST_SF − GST_0)/30 + 1 (so GST_0 carries K1) | ICD §6.4 / OSNMAlib | OSNMAlib `tesla_chain.py` index = past_keys+1; KROOT at GST_0−30 | V |
| Chain: K_i = trunc(l_k, hash(K_{i+1} ‖ GST_SF,i ‖ α)) with output-key GST | ICD §6.4 / OSNMAlib | matches OSNMAlib `_compute_next_key`; `crypto.test.ts` GST-binding test | V |
| Merkle leaf m_i = NPKT‖NPKID‖NPK; root recomputation | ICD §6.2 | `crypto.test.ts` reproduces real root `0E63F552…`; OSNMAlib agrees | V |
| Tag0 = ADKD-0 MAC for the transmitting satellite (omits PRN_D) | ICD §4.1.1 / §6.7 | "The Tag0 field contains a tag obtained by truncating a MAC of type 'ADKD=0' for the satellite transmitting the OSNMA data" | V |
| ECDSA P-256 → 264-bit key / 512-bit sig; P-521 → 536 / 1056 | ICD §3.2.2.6 / §6.1.1 | rendered Table 6 + OSNMAlib NPK/DS sizes | V |

## Receiver behaviour (RxG)

| Claim | Authority | Verbatim / evidence | St |
|---|---|---|---|
| Cold/warm/hot start (cold = PK & KROOT not available) | RxG §4.1.1 | "4.1.1.1 Cold Start — In case the Public Key and TESLA root key in force are not available, the receiver shall first retrieve them" | V |
| Time-sync requirement T_L = 30 s; below it, all tags usable | RxG §2.1 | "The time synchronisation requirement TL is set to 30 sec. If the receiver verifies this condition, all tags for all authentication types can be used" | V |
| Slow MAC (ADKD12, 10-subframe delay) usable to T_L + 300 s | RxG §2.1 | "A receiver synchronised to GST with an accuracy better than TL + 300 sec, can process slow MAC with a 10 sub-frame delay (ADKD12)" | V |
| DSM-KROOT discarded if not complete within 1 hour | RxG §3.3 | "If a DSM-KROOT is not completed after 1 hour, the retrieved DSM blocks shall be discarded" | V |
| DSM-PKR discarded if not complete within 13 hours | RxG §3.2 | "If the DSM-PKR is not completed after 13 hours, the retrieved DSM blocks shall be discarded" | V |
| A tag is verified with the key of the next sub-frame | RxG §5.5.4 / A.6 | "The MACSEQ is verified with the key of the next sub-frame, K4" | V |
| First-fix: data authenticated by tags in the next sub-frame | RxG §5.5.1 | "next sub-frame" key/tag relationship (above) + §5.5.1 | V |
| TESLA keys verified by applying F recursively | RxG §5.4.2 | "to be used for the verification of successive TESLA chain keys, acting recursively" | V |
| NMA status re-verified via root-key signature ≥ once/hour | RxG §4.2.1 | "through the retrieval and verification of the TESLA root key signature at least once every hour" | V |
| PRN_A = transmitting satellite (SVID 1–36); PRN_D = data source | ICD §4.2.1.1 | "PRNA will take the value of the SVID of the Galileo satellite transmitting the authentication information, from 1 to 36" | V |

## Lifecycle events (RxG §4.2 / Annex B) — all confirmed by OSNMAlib run

| Claim | Authority | Verbatim / evidence | St |
|---|---|---|---|
| CREV step 2 → NMA reverses to Operational, new chain in force, CPKS still CREV | RxG Annex B.4.2.2 | "the NMA Status reverses from 'Don't Use' to 'Operational' while the CPKS flag remains set to 'Chain Revoked' … The new TESLA chain (CID = 1) … enters into force" | V |
| Renewals (EOC/NPK/NMT) stay Operational; revocations (CREV/PKREV) & OAM pass through Don't Use; OAM step 2 stops the service | RxG §4.2 + OSNMAlib | OSNMAlib NMAS op/test/dnu per scenario (e.g. oam_step2 = 0/0/119, 0 tags) | V |

## Previously-corrected prose claims (re-verified this pass)

| Claim | Authority | St |
|---|---|---|
| HF selects the chain hash only; Merkle tree hash conveyed with its root | ICD §6.1.1 (above) | V |
| Time-sync threat is a *lagging* clock (believes it is earlier) | RxG §2.1 + TESLA anti-replay principle | **D** |
| Chain-of-trust top = signatures (Merkle hashing is not "asymmetric") | crypto-primer taxonomy + ICD §6.2 (SHA-256) | V |

## Residual items requiring human-SME confirmation

| Item | Why residual |
|---|---|
| Minimum tag length L_t^min / tag accumulation | Not specified in OS SIS ICD v1.1 (deferred to the future Service Definition Document); the site states "a verified tag authenticates the data" as a simplification. |
| Time-sync threat **direction** wording | Derived by reasoning from §2.1 + the TESLA principle, not a single verbatim sentence; logically sound and consistent with the spec, but flagged for expert sign-off. |
| Illustrative start-up renewal thresholds (chain≈1 d, key≈1 y, tree≈10 y) | Explicitly labelled illustrative on the site; only the *ordering* is spec-grounded (tree renewal "typically after more than 10 years"). |
