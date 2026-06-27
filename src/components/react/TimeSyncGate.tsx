import { useState } from 'react';
import { motion } from 'motion/react';
import Cite from './Cite';

/**
 * Time-synchronisation gate (Rx Guidelines 2.1, 5.3).
 * T_L = 30 s. Normal tags need clock uncertainty B < T_L/2 = 15 s; slow MACs
 * tolerate B < (T_L + 300)/2 = 165 s; beyond that OSNMA cannot be used.
 */
const NORMAL = 15;
const SLOW = 165;
const MAX = 240;

type Regime = 'all' | 'slow' | 'none';

function regimeFor(b: number): Regime {
  if (b < NORMAL) return 'all';
  if (b < SLOW) return 'slow';
  return 'none';
}

const REGIME_META: Record<Regime, { color: string; title: string; detail: string }> = {
  all: {
    color: 'var(--color-ok)',
    title: 'All tags usable',
    detail: 'Clock uncertainty is below 15 s, so every ADKD type can be processed — including fast ephemeris and timing tags.',
  },
  slow: {
    color: 'var(--color-warn)',
    title: 'Slow MACs only',
    detail: 'Between 15 s and 165 s only ADKD = 12 (Slow MAC) is safe: its extra 10-subframe key delay leaves enough margin against early key disclosure.',
  },
  none: {
    color: 'var(--color-bad)',
    title: 'OSNMA cannot be used',
    detail: 'Above 165 s the receiver cannot guarantee a key was still secret when a tag arrived, so no OSNMA authentication is allowed until the clock is re-synchronised.',
  },
};

export default function TimeSyncGate() {
  const [b, setB] = useState(8);
  const regime = regimeFor(b);
  const meta = REGIME_META[regime];
  const pct = (v: number) => `${Math.min(100, (v / MAX) * 100)}%`;

  return (
    <div className="my-6 rounded-2xl border border-line bg-panel/40 p-4 sm:p-5">
      <div className="flex items-baseline justify-between">
        <label htmlFor="b-unc" className="text-sm font-medium text-ink">
          Receiver clock uncertainty <span className="font-mono text-muted">B</span>
        </label>
        <span className="font-mono text-lg font-semibold" style={{ color: meta.color }}>
          {b.toFixed(0)} s
        </span>
      </div>

      {/* number line */}
      <div className="relative mt-6 mb-2 h-10">
        <div className="absolute inset-x-0 top-4 h-2 rounded-full" style={{ background: 'var(--color-line)' }} />
        <div className="absolute top-4 h-2 rounded-l-full" style={{ left: 0, width: pct(NORMAL), background: 'var(--color-ok)' }} />
        <div className="absolute top-4 h-2" style={{ left: pct(NORMAL), width: `calc(${pct(SLOW)} - ${pct(NORMAL)})`, background: 'var(--color-warn)' }} />
        <div className="absolute top-4 h-2 rounded-r-full" style={{ left: pct(SLOW), right: 0, background: 'var(--color-bad)' }} />

        {[{ v: NORMAL, l: '15 s' }, { v: SLOW, l: '165 s' }].map((m) => (
          <div key={m.v} className="absolute top-0 -translate-x-1/2 text-center" style={{ left: pct(m.v) }}>
            <div className="mx-auto h-6 w-px" style={{ background: 'var(--color-muted)' }} />
            <span className="font-mono text-[10px] text-muted">{m.l}</span>
          </div>
        ))}

        <motion.div
          className="absolute -top-1 -translate-x-1/2"
          animate={{ left: pct(b) }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <div
            className="h-6 w-6 rounded-full border-2 border-base"
            style={{ background: meta.color, boxShadow: `0 0 12px ${meta.color}` }}
          />
        </motion.div>
      </div>

      <input
        id="b-unc"
        type="range"
        min={0}
        max={MAX}
        step={1}
        value={b}
        onChange={(e) => setB(parseInt(e.target.value, 10))}
        className="w-full accent-[var(--color-brand)]"
      />

      <motion.div
        key={regime}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-4 rounded-xl border p-4"
        style={{ borderColor: meta.color + '66', background: meta.color + '12' }}
      >
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: meta.color }} />
          <span className="text-sm font-bold" style={{ color: meta.color }}>
            {meta.title}
          </span>
          <span className="ml-auto">
            <Cite doc="rxg" section="2.1" />
          </span>
        </div>
        <p className="mt-2 text-sm text-ink/90">{meta.detail}</p>
      </motion.div>
    </div>
  );
}
