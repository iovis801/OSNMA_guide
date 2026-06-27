/**
 * Receiver start-up model (Galileo OSNMA Receiver Guidelines v1.3, section 4.1.1).
 *
 * Given a start-up scenario (cold / warm / hot) and how long the receiver has
 * been switched off, this computes which cryptographic resources can be reused
 * from non-volatile memory and which must be re-acquired, plus a rough
 * time-to-first-authenticated-fix and the number of one-way hash steps needed to
 * re-anchor the TESLA chain.
 *
 * Firm facts from the documents:
 *   - DSM-KROOT must be received within 1 h, DSM-PKR within 13 h (Rx Guidelines 3.2/3.3).
 *   - One TESLA key per 30 s subframe; re-verifying across a gap costs one hash
 *     application per missed subframe (Rx Guidelines 5.4.2).
 *   - Time-sync uncertainty must be < 15 s for normal tags (Rx Guidelines 2.1).
 *
 * The renewal thresholds below (chain ~1 day, public key ~1 year, Merkle tree
 * ~10 years) set only the *ordering* of how reusable each resource is. The exact
 * chain/key lifetimes are operational parameters; these values are illustrative
 * and the UI labels them as such. The relative frequency (chain << key << tree)
 * is what the guidelines establish.
 */

export type Scenario = 'cold' | 'warm' | 'hot';
export type StageStatus = 'reuse' | 'acquire-sis' | 'download-oob' | 'derive' | 'verify';

export interface StartupStage {
  id: string;
  title: string;
  status: StageStatus;
  detail: string;
  doc: 'icd' | 'rxg';
  section: string;
  /** Worst-case on-signal reception wait contributed, in seconds. */
  waitSeconds?: number;
  /** Short badge, e.g. "2 880 hash steps". */
  meta?: string;
}

export interface StartupResult {
  scenario: Scenario;
  effectiveScenario: Scenario;
  elapsedSeconds: number;
  stages: StartupStage[];
  ttfafSeconds: number;
  hashSteps: number;
  notes: string[];
}

export const SUBFRAME = 30;
export const HOUR = 3600;
export const DAY = 86400;
export const YEAR = 365 * DAY;

const CHAIN_RENEW = DAY; // chain likely rolled over beyond ~1 day off
const PK_RENEW = YEAR; // public key renewal horizon (illustrative)
const MERKLE_RENEW = 10 * YEAR; // Merkle tree renewal horizon (>10 years)

const KROOT_WINDOW = HOUR; // DSM-KROOT reception deadline
const PKR_WINDOW = 13 * HOUR; // DSM-PKR reception deadline

export interface StoredState {
  merkleRoot: boolean;
  publicKey: boolean;
  kroot: boolean;
}

export function storedFor(scenario: Scenario): StoredState {
  switch (scenario) {
    case 'cold':
      return { merkleRoot: true, publicKey: false, kroot: false };
    case 'warm':
      return { merkleRoot: true, publicKey: true, kroot: false };
    case 'hot':
      return { merkleRoot: true, publicKey: true, kroot: true };
  }
}

export function computeStartup(scenario: Scenario, elapsedSeconds: number): StartupResult {
  const stored = storedFor(scenario);
  const merkleStale = elapsedSeconds > MERKLE_RENEW;
  const pkStale = elapsedSeconds > PK_RENEW || merkleStale;
  const chainStale = elapsedSeconds > CHAIN_RENEW || pkStale;

  const stages: StartupStage[] = [];
  const notes: string[] = [];

  // 1 — Time synchronisation (always required before any OSNMA processing).
  stages.push({
    id: 'time',
    title: 'Synchronise time',
    status: 'acquire-sis',
    detail:
      'Read GST from the signal (word type 0/5 or the SSP) and confirm the local clock uncertainty is under 15 s. Without this gate, a delayed key could already be public and tags could be forged.',
    doc: 'rxg',
    section: '2.1 / 5.3',
    waitSeconds: SUBFRAME,
  });

  // 2 — Merkle root (the out-of-band anchor of trust).
  stages.push(
    merkleStale
      ? {
          id: 'merkle',
          title: 'Refresh the Merkle root',
          status: 'download-oob',
          detail:
            'The stored root is older than the tree-renewal horizon. Download the new Merkle root out-of-band from the GSC OSNMA server and re-verify it via its PKI certificate chain.',
          doc: 'rxg',
          section: '3.1',
        }
      : {
          id: 'merkle',
          title: 'Load the Merkle root',
          status: 'reuse',
          detail:
            'The Merkle root held in non-volatile memory is still valid — trees are renewed only on a multi-year horizon — so it is reused directly as the anchor of trust.',
          doc: 'rxg',
          section: '3.1',
        },
  );

  // 3 — Public key (verified against the Merkle root).
  const needPk = !stored.publicKey || pkStale;
  stages.push(
    needPk
      ? {
          id: 'pk',
          title: stored.publicKey ? 'Re-acquire the public key' : 'Acquire the public key',
          status: 'acquire-sis',
          detail: stored.publicKey
            ? 'After this much time off the public key may have been renewed or revoked, so the stored copy cannot be trusted. Collect the DSM-PKR from the signal (or fetch it from the GSC server) and re-verify it against the Merkle root.'
            : 'No public key is stored. Collect the DSM-PKR from the signal — up to a 13 h reception window — and verify it against the Merkle root by recomputing the tree. The GSC server offers the same key out-of-band for an instant shortcut.',
          doc: 'rxg',
          section: '5.1',
          waitSeconds: PKR_WINDOW,
        }
      : {
          id: 'pk',
          title: 'Reuse the public key',
          status: 'reuse',
          detail:
            'A previously verified public key is restored from memory, so the Merkle-tree climb can be skipped entirely. This is the time warm start saves over cold start.',
          doc: 'rxg',
          section: '4.1.1.2',
        },
  );

  // 4 — TESLA root key (KROOT), signed by the public key.
  const reuseKroot = stored.kroot && !chainStale;
  stages.push(
    reuseKroot
      ? {
          id: 'kroot',
          title: 'Reuse the TESLA root key',
          status: 'reuse',
          detail:
            'A previously verified KROOT and its chain parameters are restored from memory, so the DSM-KROOT signature does not need to be re-fetched or re-verified. This is what makes hot start fast.',
          doc: 'rxg',
          section: '4.1.1.3',
        }
      : {
          id: 'kroot',
          title: stored.kroot ? 'Re-acquire the TESLA root key' : 'Acquire the TESLA root key',
          status: 'acquire-sis',
          detail: stored.kroot
            ? 'The stored KROOT belongs to a chain that has since rolled over, so a new DSM-KROOT is needed. Collect it from the signal (1 h window) and verify its ECDSA signature with the public key.'
            : 'Collect the DSM-KROOT from the signal — a 1 h reception window — and verify its ECDSA signature with the verified public key. This authenticates KROOT and all the chain parameters (HF, MF, KS, TS, MACLT, α, GST_0).',
          doc: 'rxg',
          section: '5.2 / 3.3',
          waitSeconds: KROOT_WINDOW,
        },
  );

  // 5 — TESLA chain key verification (the variable-time part).
  let hashSteps = 0;
  if (reuseKroot) {
    // A hot start caches its last verified key, so the climb is proportional to
    // the off-time, capped at the chain lifetime.
    hashSteps = Math.max(1, Math.ceil(Math.min(elapsedSeconds, CHAIN_RENEW) / SUBFRAME));
    stages.push({
      id: 'chain',
      title: 'Re-anchor the chain',
      status: 'derive',
      detail:
        'Hash the first freshly received key backward with F until it meets the last key you already trusted. One hash per missed 30 s subframe — cheap, and bounded by your off-time.',
      doc: 'rxg',
      section: '5.4.2',
      meta: `${hashSteps.toLocaleString('en-US')} hash step${hashSteps === 1 ? '' : 's'}`,
    });
  } else {
    stages.push({
      id: 'chain',
      title: 'Anchor the chain to KROOT',
      status: 'derive',
      detail:
        'Verify the first received key by hashing it backward with F down to KROOT — a one-time climb of the chain. Cache the verified key so future keys cost a single hash each.',
      doc: 'rxg',
      section: '5.4',
    });
  }

  // 6 — Tag verification → navigation data authenticated.
  stages.push({
    id: 'tags',
    title: 'Authenticate navigation data',
    status: 'verify',
    detail:
      'With a verified key, recompute each tag MAC over the buffered navigation data. A match authenticates that satellite’s data; accumulate tags to the required strength for a fully authenticated fix.',
    doc: 'rxg',
    section: '5.5',
  });

  // Effective scenario after time degradation.
  let effectiveScenario: Scenario = scenario;
  if (scenario === 'hot' && !reuseKroot) effectiveScenario = needPk ? 'cold' : 'warm';
  if (scenario === 'warm' && needPk) effectiveScenario = 'cold';

  // Time-to-first-authenticated-fix: dominated by the largest on-signal wait.
  const reuseOnly = stages.every((s) => s.status === 'reuse' || s.status === 'derive' || s.status === 'verify' || s.id === 'time');
  let ttfafSeconds: number;
  if (reuseKroot && !needPk && !merkleStale) {
    ttfafSeconds = SUBFRAME; // next subframe delivers a key
  } else if (needPk) {
    ttfafSeconds = PKR_WINDOW;
  } else {
    ttfafSeconds = KROOT_WINDOW;
  }

  if (needPk && stored.publicKey) {
    notes.push('Off long enough that the public key may have changed — warm/hot start degrades toward cold.');
  }
  if (!reuseKroot && stored.kroot) {
    notes.push('Off longer than the chain lifetime — the cached KROOT is stale and a fresh DSM-KROOT is required.');
  }
  if (merkleStale) {
    notes.push('Beyond the Merkle-tree renewal horizon — even the root of trust must be refreshed out-of-band.');
  }
  if (reuseOnly && ttfafSeconds === SUBFRAME) {
    notes.push('Everything reused: a hot start can re-authenticate within a single subframe.');
  }

  return {
    scenario,
    effectiveScenario,
    elapsedSeconds,
    stages,
    ttfafSeconds,
    hashSteps,
    notes,
  };
}

/** Human-readable duration for the slider and outputs. */
export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)} s`;
  if (seconds < HOUR) return `${Math.round(seconds / 60)} min`;
  if (seconds < DAY) return `${(seconds / HOUR).toFixed(seconds < 10 * HOUR ? 1 : 0)} h`;
  if (seconds < 30 * DAY) return `${(seconds / DAY).toFixed(seconds < 10 * DAY ? 1 : 0)} days`;
  if (seconds < YEAR) return `${Math.round(seconds / DAY)} days`;
  return `${(seconds / YEAR).toFixed(seconds < 10 * YEAR ? 1 : 0)} years`;
}
