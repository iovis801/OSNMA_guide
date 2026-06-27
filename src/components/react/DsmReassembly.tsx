import { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Cite from './Cite';
import StepControls from './StepControls';
import { useStepper } from './useStepper';

/**
 * Shows a DSM-KROOT (8 blocks, BID 0-7) being reassembled from blocks that arrive
 * out of order and redundantly from several satellites — because OSNMA data is
 * common to the constellation and any OSNMA satellite can carry any block
 * (Rx Guidelines 3.3).
 */
const SATS = ['E02', 'E11', 'E12', 'E19'];
const NBLOCKS = 8;

// Deterministic arrival sequence: one block per 30 s subframe, with two duplicates.
const ARRIVALS: { sat: number; bid: number }[] = [
  { sat: 0, bid: 0 },
  { sat: 2, bid: 3 },
  { sat: 1, bid: 1 },
  { sat: 0, bid: 3 }, // duplicate
  { sat: 3, bid: 2 },
  { sat: 2, bid: 5 },
  { sat: 1, bid: 4 },
  { sat: 0, bid: 7 },
  { sat: 3, bid: 1 }, // duplicate
  { sat: 2, bid: 6 }, // completes 0..7
];

export default function DsmReassembly() {
  const { index, setIndex, next, prev, reset, playing, togglePlay, atStart, atEnd } = useStepper(ARRIVALS.length, 1300);

  const { collected, current, isDup } = useMemo(() => {
    const set = new Set<number>();
    let dup = false;
    for (let i = 0; i <= index; i++) {
      const a = ARRIVALS[i];
      if (i === index) dup = set.has(a.bid);
      set.add(a.bid);
    }
    return { collected: set, current: ARRIVALS[index], isDup: dup };
  }, [index]);

  const complete = collected.size >= NBLOCKS;

  return (
    <div className="my-6 rounded-2xl border border-line bg-panel/40 p-4 sm:p-5">
      {/* satellites */}
      <div className="flex justify-around gap-2">
        {SATS.map((s, i) => {
          const active = i === current.sat;
          return (
            <motion.div
              key={s}
              animate={{ scale: active ? 1.06 : 1, opacity: active ? 1 : 0.6 }}
              className="flex flex-col items-center"
            >
              <div
                className="grid h-10 w-10 place-items-center rounded-full border-2"
                style={{
                  borderColor: active ? 'var(--color-brand)' : 'var(--color-line)',
                  background: active ? 'var(--color-brand)' + '22' : 'var(--color-panel)',
                  boxShadow: active ? '0 0 14px var(--color-brand)' : 'none',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={active ? 'var(--color-brand-bright)' : 'var(--color-muted)'} strokeWidth="2">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M4 12a8 8 0 0 1 8-8M20 12a8 8 0 0 1-8 8" />
                </svg>
              </div>
              <span className="mt-1 font-mono text-[11px] text-muted">{s}</span>
            </motion.div>
          );
        })}
      </div>

      {/* current transmission */}
      <div className="my-3 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.25 }}
            className="rounded-lg border px-3 py-1.5 text-sm"
            style={{
              borderColor: isDup ? 'var(--color-muted)' : 'var(--color-tag)',
              background: (isDup ? 'var(--color-muted)' : 'var(--color-tag)') + '14',
              color: isDup ? 'var(--color-muted)' : 'var(--color-tag)',
            }}
          >
            {SATS[current.sat]} → block BID {current.bid}
            {isDup && <span className="ml-2 text-[11px]">already held — ignored</span>}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* block slots */}
      <div className="grid grid-cols-8 gap-1.5">
        {Array.from({ length: NBLOCKS }).map((_, bid) => {
          const has = collected.has(bid);
          const justArrived = bid === current.bid && !isDup;
          return (
            <motion.div
              key={bid}
              animate={{
                scale: justArrived ? [1, 1.15, 1] : 1,
                borderColor: has ? 'var(--color-ok)' : 'var(--color-line)',
                background: has ? 'var(--color-ok)' + '1a' : 'transparent',
              }}
              transition={{ duration: 0.35 }}
              className="rounded-md border py-2 text-center"
            >
              <div className="text-[9px] text-muted">BID</div>
              <div className="font-mono text-sm font-bold" style={{ color: has ? 'var(--color-ok)' : 'var(--color-muted)' }}>
                {bid}
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-2 flex items-center justify-between text-xs">
        <span className="text-muted">
          Collected <span className="font-mono text-ink">{collected.size}</span> / {NBLOCKS} blocks
        </span>
        <Cite doc="rxg" section="3.3" />
      </div>

      <div className="mt-4">
        <StepControls
          index={index}
          count={ARRIVALS.length}
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

      <AnimatePresence>
        {complete && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 rounded-xl border border-ok/50 bg-ok/10 p-3"
          >
            <p className="text-sm font-semibold text-ok">✓ DSM-KROOT reassembled (8/8 blocks)</p>
            <p className="mt-1 text-sm text-ink/90">
              The receiver orders the blocks by BID, recovers the full message, and verifies its ECDSA signature with
              the public key — yielding a trusted KROOT. Blocks could come from any mix of satellites and subframes;
              only completeness matters.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="mt-3 text-xs text-muted">
        A DSM-KROOT spans 8 blocks of 104 bits, one per subframe, so it takes minutes to gather — and must complete
        within one hour or the partial blocks are discarded.
      </p>
    </div>
  );
}
