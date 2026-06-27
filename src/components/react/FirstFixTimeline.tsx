import { motion } from 'motion/react';
import Cite from './Cite';
import StepControls from './StepControls';
import { useStepper } from './useStepper';
import { FIX_REQUIRED } from '@/data/inav-words';

/**
 * The journey from power-on to a first AUTHENTICATED fix: collect the navigation
 * words for a position (TTFF), then the OSNMA tag + delayed key to authenticate
 * them (TTFAF). Shows why authentication adds latency on top of the plain fix.
 */
interface Phase {
  id: string;
  title: string;
  detail: string;
  doc: 'icd' | 'rxg';
  section: string;
  marker?: 'ttff' | 'ttfaf';
}

const PHASES: Phase[] = [
  {
    id: 'acquire',
    title: 'Acquire & synchronise',
    detail:
      'Lock onto E1-B, decode the I/NAV pages, recover GST and pass the time-sync gate (clock uncertainty under 15 s).',
    doc: 'rxg',
    section: '2.1',
  },
  {
    id: 'words',
    title: 'Collect the navigation words',
    detail:
      'Decode word types 1-5 (orbit, clock, ionosphere, health) plus time. They are spread across the 15 pages of the subframe, so this takes most of a subframe to assemble.',
    doc: 'icd',
    section: '2',
  },
  {
    id: 'fix',
    title: 'Position fix available (TTFF)',
    detail:
      'With ephemeris and clock decoded, the receiver can already compute a position — but nothing yet proves the data is genuine.',
    doc: 'rxg',
    section: '4.1',
    marker: 'ttff',
  },
  {
    id: 'tags',
    title: 'Buffer the OSNMA tags',
    detail:
      'The MACK of the same subframe carries tags (ADKD = 0) over word types 1-5. The receiver buffers the data and its tags.',
    doc: 'icd',
    section: '4.2',
  },
  {
    id: 'key',
    title: 'Receive & verify the key',
    detail:
      'The key that produced those tags is disclosed only in the NEXT subframe (+30 s). The receiver hashes it back to the chain to confirm it is genuine.',
    doc: 'rxg',
    section: '5.4',
  },
  {
    id: 'verify',
    title: 'Authenticate the data',
    detail:
      'Recompute the tag MAC over the buffered words with the verified key. A match authenticates the ephemeris and clock that fed the fix.',
    doc: 'rxg',
    section: '5.5',
  },
  {
    id: 'authfix',
    title: 'First authenticated fix (TTFAF)',
    detail:
      'The position is now backed by authenticated data. The gap after TTFF is the price of delayed key disclosure — typically at least one extra subframe.',
    doc: 'rxg',
    section: '4.1',
    marker: 'ttfaf',
  },
];

const OSNMA_ITEMS = [
  { label: 'Tag (ADKD=0)', phase: 3, color: 'var(--color-tag)' },
  { label: 'TESLA key', phase: 4, color: 'var(--color-key)' },
  { label: 'MAC match', phase: 5, color: 'var(--color-ok)' },
];

export default function FirstFixTimeline() {
  const { index, setIndex, next, prev, reset, playing, togglePlay, atStart, atEnd } = useStepper(PHASES.length, 1700);
  const phase = PHASES[index];
  const wordsCollected = index >= 1;
  const ttff = index >= 2;
  const ttfaf = index >= 6;

  return (
    <div className="my-6 rounded-2xl border border-line bg-panel/40 p-4 sm:p-5">
      {/* timeline bar */}
      <div className="relative mb-6 h-12">
        <div className="absolute inset-x-0 top-7 h-1.5 rounded-full bg-line" />
        <motion.div
          className="absolute top-7 h-1.5 rounded-full"
          style={{ background: 'linear-gradient(90deg, var(--color-brand), var(--color-ok))' }}
          animate={{ width: `${(index / (PHASES.length - 1)) * 100}%` }}
          transition={{ duration: 0.4 }}
        />
        <Flag show={ttff} left="40%" label="TTFF" color="var(--color-brand-bright)" sub="position" />
        <Flag show={ttfaf} left="92%" label="TTFAF" color="var(--color-ok)" sub="authenticated" />
      </div>

      {/* nav words */}
      <div className="mb-1 text-xs font-semibold text-muted">Navigation words needed for a fix</div>
      <div className="flex flex-wrap gap-1.5">
        {FIX_REQUIRED.map((w, i) => (
          <motion.div
            key={w.wt}
            animate={{
              opacity: wordsCollected ? 1 : 0.35,
              borderColor: wordsCollected ? 'var(--color-brand)' : 'var(--color-line)',
            }}
            transition={{ delay: wordsCollected ? i * 0.08 : 0 }}
            className="rounded-md border bg-base/60 px-2 py-1 text-center"
            title={w.carries}
          >
            <div className="font-mono text-[11px] font-semibold text-ink">{w.wt}</div>
            {w.adkd === 0 && <div className="text-[8px] text-tag">ADKD 0</div>}
          </motion.div>
        ))}
      </div>

      {/* osnma items */}
      <div className="mt-3 mb-1 text-xs font-semibold text-muted">OSNMA authentication material</div>
      <div className="flex flex-wrap gap-2">
        {OSNMA_ITEMS.map((it) => {
          const on = index >= it.phase;
          return (
            <motion.div
              key={it.label}
              animate={{ opacity: on ? 1 : 0.3 }}
              className="rounded-md border px-2.5 py-1 text-xs font-medium"
              style={{ borderColor: on ? it.color : 'var(--color-line)', color: on ? it.color : 'var(--color-muted)', background: on ? it.color + '12' : 'transparent' }}
            >
              {on ? '✓ ' : ''}
              {it.label}
            </motion.div>
          );
        })}
      </div>

      <div className="mt-4">
        <StepControls
          index={index}
          count={PHASES.length}
          playing={playing}
          atStart={atStart}
          atEnd={atEnd}
          onPrev={prev}
          onNext={next}
          onReset={reset}
          onTogglePlay={togglePlay}
          onGoTo={setIndex}
          labels={PHASES.map((p) => p.title)}
        />
      </div>

      <motion.div key={index} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-4 rounded-xl border border-line bg-base/60 p-4">
        <div className="flex items-center gap-2">
          <span
            className="grid h-6 w-6 place-items-center rounded-full text-xs font-bold"
            style={{ background: 'var(--color-brand)' + '22', color: 'var(--color-brand-bright)' }}
          >
            {index + 1}
          </span>
          <span className="text-sm font-semibold text-ink">{phase.title}</span>
          <span className="ml-auto"><Cite doc={phase.doc} section={phase.section} /></span>
        </div>
        <p className="mt-2 text-sm text-ink/90">{phase.detail}</p>
      </motion.div>
    </div>
  );
}

function Flag({ show, left, label, color, sub }: { show: boolean; left: string; label: string; color: string; sub: string }) {
  return (
    <motion.div className="absolute top-0 -translate-x-1/2 text-center" style={{ left }} animate={{ opacity: show ? 1 : 0.25, y: show ? 0 : 4 }}>
      <div className="font-mono text-[11px] font-bold" style={{ color }}>
        {label}
      </div>
      <div className="text-[9px] text-muted">{sub}</div>
      <div className="mx-auto mt-0.5 h-4 w-px" style={{ background: color }} />
    </motion.div>
  );
}
