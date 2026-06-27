import { useMemo } from 'react';
import { motion } from 'motion/react';
import Cite from './Cite';
import StepControls from './StepControls';
import { useStepper } from './useStepper';
import { deriveChain, type ChainKey } from '@/data/crypto/tesla';
import { shortHex } from '@/data/crypto/bytes';

/**
 * TESLA one-way chain walkthrough. The chain is generated live with the same
 * hashChainStep used in the verified crypto tests, so the verification really
 * reproduces the root. Generation runs seed -> root; broadcast and verification
 * run root -> ... -> Kn in the opposite direction.
 */
const SEED = '0f1e2d3c4b5a69788796a5b4c3d2e1f0';
const ALPHA = '610bdf26d77b';
const LK = 128;
const N = 5; // chain K0..K5

export default function TeslaChain() {
  const chain = useMemo(
    () => deriveChain(SEED, ALPHA, LK, 'SHA-256', N, 1248, 0),
    [],
  );
  // count: step 0 = received key; steps 1..N = F applications down to root.
  const { index, setIndex, next, prev, reset, playing, togglePlay, atStart, atEnd } = useStepper(N + 1, 1400);

  // After `index` F-applications, node (N - index) is the newly derived/verified one.
  const verifiedFrom = N - index; // nodes with index >= verifiedFrom are verified
  const atRoot = index >= N;

  return (
    <div className="my-6 rounded-2xl border border-line bg-panel/40 p-4 sm:p-5">
      {/* direction legend */}
      <div className="mb-4 grid gap-2 text-xs sm:grid-cols-2">
        <div className="rounded-lg border border-line bg-base/50 px-3 py-2">
          <span className="font-semibold text-key">Generation (secret):</span>
          <span className="text-muted"> seed K{N} → … → K0 root, by repeated hashing.</span>
        </div>
        <div className="rounded-lg border border-line bg-base/50 px-3 py-2">
          <span className="font-semibold text-tag">Broadcast (public):</span>
          <span className="text-muted"> K0 first, then one key every 30 s subframe.</span>
        </div>
      </div>

      {/* chain */}
      <div className="overflow-x-auto pb-2">
        <div className="flex min-w-max items-center gap-1">
          {chain.map((k: ChainKey, i) => {
            const isRoot = i === 0;
            const isReceived = i === N;
            const verified = i >= verifiedFrom;
            const justDerived = i === verifiedFrom && index > 0;
            const color = isRoot ? 'var(--color-key)' : verified ? 'var(--color-ok)' : 'var(--color-line)';
            return (
              <div key={i} className="flex items-center">
                <motion.div
                  animate={{
                    scale: justDerived || (isReceived && index === 0) ? 1.05 : 1,
                    opacity: verified || isReceived ? 1 : 0.5,
                  }}
                  transition={{ duration: 0.25 }}
                  className="w-28 rounded-lg border bg-base/60 p-2 text-center"
                  style={{ borderColor: color }}
                >
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-sm font-bold" style={{ color }}>
                      K{i}
                    </span>
                    {isRoot && <span className="rounded bg-key/20 px-1 text-[9px] font-semibold text-key">ROOT</span>}
                    {isReceived && <span className="rounded bg-tag/20 px-1 text-[9px] font-semibold text-tag">RX</span>}
                  </div>
                  <div className="mt-1 font-mono text-[10px] text-muted" title={k.keyHex}>
                    {shortHex(k.keyHex, 6, 4)}
                  </div>
                  {verified && i !== N && (
                    <div className="mt-0.5 text-[9px] font-semibold text-ok">verified</div>
                  )}
                </motion.div>

                {i < N && (
                  <div className="flex w-8 flex-col items-center" title="F: hash back one step">
                    <motion.svg
                      width="22"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={i + 1 === verifiedFrom + 1 && justDerived ? 'var(--color-ok)' : 'var(--color-muted)'}
                      strokeWidth="2"
                      animate={{ opacity: i >= verifiedFrom && index > 0 ? 1 : 0.4 }}
                    >
                      {/* arrow points left: from K_{i+1} back to K_i */}
                      <polyline points="15 6 9 12 15 18" />
                      <line x1="9" y1="12" x2="20" y2="12" />
                    </motion.svg>
                    <span className="text-[8px] text-muted">F</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4">
        <StepControls
          index={index}
          count={N + 1}
          playing={playing}
          atStart={atStart}
          atEnd={atEnd}
          onPrev={prev}
          onNext={next}
          onReset={reset}
          onTogglePlay={togglePlay}
          onGoTo={setIndex}
        />
      </div>

      {/* narration */}
      <motion.div
        key={index}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-4 rounded-xl border border-line bg-base/60 p-4"
      >
        {index === 0 ? (
          <p className="text-sm text-ink/90">
            The receiver has just received key <strong className="text-tag">K{N}</strong>. On its own it proves
            nothing — anyone could broadcast bits. To trust it, the receiver hashes it backward with the one-way
            function <span className="font-mono text-key">F</span> and checks it lands on the root it already trusts.
          </p>
        ) : atRoot ? (
          <p className="text-sm text-ink/90">
            After <strong className="text-ok">{N}</strong> applications of <span className="font-mono">F</span>, the
            result equals the stored root <strong className="text-key">K0 (KROOT)</strong>. The match proves K{N} — and
            every key in between — genuinely belongs to this chain.
          </p>
        ) : (
          <p className="text-sm text-ink/90">
            Step {index}: apply <span className="font-mono text-key">F</span> to{' '}
            <strong>K{verifiedFrom + 1}</strong> to derive <strong className="text-ok">K{verifiedFrom}</strong>. Each
            step is one hash of <span className="font-mono">K ‖ GST_SF ‖ α</span>, truncated to {LK} bits.
          </p>
        )}
        <div className="mt-2 flex items-center gap-2">
          <Cite doc="rxg" section="5.4.2" />
          <Cite doc="icd" section="6.4" />
          {atRoot && (
            <span className="rounded bg-ok/15 px-2 py-0.5 text-[11px] font-semibold text-ok">root match ✓</span>
          )}
        </div>
      </motion.div>

      <p className="mt-3 text-xs text-muted">
        Keys here are generated live with the same code the test suite checks against the official vectors, so the
        backward derivation genuinely reproduces the root.
      </p>
    </div>
  );
}
