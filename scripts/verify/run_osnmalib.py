"""
Drive the OSNMAlib reference implementation over the official EUSPA OSNMA test
vectors and assert the published authentication results, with a Windows-safe
status-log path (the upstream harness assumes Unix '/' separators).

Usage:
    python -m venv venv
    venv/Scripts/python -m pip install -r <osnmalib>/requirements.txt
    venv/Scripts/python scripts/verify/run_osnmalib.py

Edit LIB / TESTS if OSNMAlib lives elsewhere. Prints "N/N ... reproduced EXACTLY".
"""
import sys
import logging
import re
from pathlib import Path

LIB = r"C:\Personal\OSNMA_test_vector\osnmalib"
TESTS = r"C:\Personal\OSNMA_test_vector\osnmalib\tests"
sys.path.insert(0, LIB)
sys.path.insert(0, TESTS)

import icd_test_vectors as T  # noqa: E402
from osnma.receiver.receiver import OSNMAReceiver  # noqa: E402

current = [""]
results = {}


def fixed_run(input_module, config_dict, expected):
    osnma_r = OSNMAReceiver(input_module, config_dict)
    osnma_r.start()
    base_logger, fh, log_filename = T.get_base_logger_and_file_handler("osnma")
    if fh:
        base_logger.removeHandler(fh)
    lp = Path(log_filename)
    text = lp.read_text(encoding="utf-8", errors="ignore")
    m = {
        "tags_auth": len(re.findall(r"Tag AUTHENTICATED", text)),
        "data_auth": len(re.findall(r"INFO .* AUTHENTICATED: ADKD", text)),
        "kroot_auth": len(re.findall(r"INFO .*KROOT.*\n\tAUTHENTICATED\n", text)),
        "broken_kroot": len(re.findall("WARNING.*Broken HKROOT", text)),
        "crc_failed": len(re.findall("WARNING.*CRC", text)),
        "warnings": len(re.findall("WARNING", text)),
        "errors": len(re.findall("ERROR", text)),
    }
    s = (lp.parent / "status_log.json").read_text(encoding="utf-8", errors="ignore")
    m.update({
        "total_subframes": len(re.findall(r'"GST_subframe":', s)),
        "nmas_operational": len(re.findall(r'\"nma_status\": \{\"nmas\": \"OPERATIONAL\"', s)),
        "nmas_test": len(re.findall(r'\"nma_status\": \{\"nmas\": \"TEST\"', s)),
        "nmas_dnu": len(re.findall(r'\"nma_status\": \{\"nmas\": \"DONT_USE\"', s)),
        "total_cpks_nominal": len(re.findall(r'\"nma_status\".*\"cpks\": \"NOMINAL\".*\"tesla_chain_in_force', s)),
        "total_npkid": len(re.findall(r'\"public_key_in_force\": \{\"npkid\"', s)),
    })
    mism = {k: (m[k], expected[k]) for k in expected if k in m and m[k] != expected[k]}
    results[current[0]] = (not mism, m)
    if mism:
        raise AssertionError(str(mism))


T.run = fixed_run
names = sorted(n for n in dir(T) if n.startswith("test_vectors_"))
passed = 0
for n in names:
    current[0] = n
    try:
        getattr(T, n)(logging.CRITICAL)
        print(f"PASS  {n}")
        passed += 1
    except AssertionError as e:
        print(f"FAIL  {n}: {e}")
    except Exception as e:  # noqa: BLE001
        print(f"ERROR {n}: {type(e).__name__}: {e}")

print(f"\n=== {passed}/{len(names)} official scenarios reproduced EXACTLY by OSNMAlib ===")
