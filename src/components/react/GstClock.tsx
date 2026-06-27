import { useState } from 'react';
import { motion } from 'motion/react';
import Cite from './Cite';

/**
 * Shows how a continuous GST time is quantised to a 30 s subframe boundary
 * (GST_SF), and how that fixes the TESLA key index (Rx Guidelines 5.3).
 */
const WINDOW = 120; // seconds shown (4 subframes)
const SUB = 30;
const WN = 1248;
const TOW0 = 345600; // illustrative chain start (TOWH_K = 96 h)

export default function GstClock() {
  const [t, setT] = useState(48);
  const subIndex = Math.floor(t / SUB);
  const gstSfOffset = subIndex * SUB;
  const tow = TOW0 + gstSfOffset;
  const keyIndex = subIndex; // I = (GST_SF - GST_0)/30, with GST_0 at offset 0 here

  const pct = (v: number) => `${(v / WINDOW) * 100}%`;

  return (
    <div className="my-6 rounded-2xl border border-line bg-panel/40 p-4 sm:p-5">
      <div className="flex items-baseline justify-between">
        <label htmlFor="gst" className="text-sm font-medium text-ink">
          Time within the window
        </label>
        <span className="font-mono text-lg font-semibold text-brand-bright">{t.toFixed(0)} s</span>
      </div>

      <div className="relative mt-6 mb-3 h-12">
        {/* subframe segments */}
        {Array.from({ length: WINDOW / SUB }).map((_, i) => (
          <div
            key={i}
            className="absolute top-3 h-6 rounded"
            style={{
              left: pct(i * SUB),
              width: `calc(${pct(SUB)} - 3px)`,
              background: i === subIndex ? 'var(--color-brand)' + '33' : 'var(--color-panel2)',
              border: `1px solid ${i === subIndex ? 'var(--color-brand)' : 'var(--color-line)'}`,
            }}
          >
            <span className="absolute inset-x-0 top-1.5 text-center font-mono text-[10px] text-muted">
              K{i}
            </span>
          </div>
        ))}
        {/* tick labels */}
        {Array.from({ length: WINDOW / SUB + 1 }).map((_, i) => (
          <span key={i} className="absolute top-10 -translate-x-1/2 font-mono text-[9px] text-muted" style={{ left: pct(i * SUB) }}>
            {i * SUB}s
          </span>
        ))}
        {/* marker */}
        <motion.div className="absolute top-1 -translate-x-1/2" animate={{ left: pct(t) }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
          <div className="h-9 w-0.5 bg-brand-bright" />
          <div className="-ml-1 -mt-9 h-2.5 w-2.5 rounded-full bg-brand-bright" />
        </motion.div>
      </div>

      <input id="gst" type="range" min={0} max={WINDOW} step={1} value={t} onChange={(e) => setT(parseInt(e.target.value, 10))} className="w-full accent-[var(--color-brand)]" />

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Field label="WN" value={WN.toString()} />
        <Field label="TOW (s)" value={tow.toLocaleString('en-US')} accent="var(--color-brand-bright)" />
        <Field label="GST_SF offset" value={`${gstSfOffset} s`} accent="var(--color-brand-bright)" />
        <Field label="Key index I" value={`K${keyIndex}`} accent="var(--color-key)" />
      </div>

      <p className="mt-3 text-xs text-muted">
        Any instant inside a 30 s window maps to the same GST_SF — the start of that subframe — and so to the same key
        index. That shared, quantised time is what lets every receiver agree on which key verifies which tag.
        <span className="ml-1 inline-block align-middle"><Cite doc="rxg" section="5.3" /></span>
      </p>
    </div>
  );
}

function Field({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="rounded-lg border border-line bg-base/50 p-2.5 text-center">
      <div className="text-[10px] font-semibold uppercase tracking-wide text-muted">{label}</div>
      <div className="mt-0.5 font-mono text-sm font-bold" style={{ color: accent ?? 'var(--color-ink)' }}>
        {value}
      </div>
    </div>
  );
}
