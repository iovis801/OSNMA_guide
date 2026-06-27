import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Cite from '../Cite';
import StepControls from '../StepControls';
import { useStepper } from '../useStepper';
import {
  type Scenario,
  type StageStatus,
  computeStartup,
  formatDuration,
  YEAR,
} from './model';

const SCENARIOS: { id: Scenario; name: string; stored: string }[] = [
  { id: 'cold', name: 'Cold start', stored: 'Only the Merkle root (out-of-band).' },
  { id: 'warm', name: 'Warm start', stored: 'Merkle root + a verified public key.' },
  { id: 'hot', name: 'Hot start', stored: 'Merkle root + public key + verified KROOT.' },
];

const STATUS_META: Record<StageStatus, { color: string; label: string }> = {
  reuse: { color: 'var(--color-ok)', label: 'Reused from memory' },
  'acquire-sis': { color: 'var(--color-brand)', label: 'Fetch from signal' },
  'download-oob': { color: 'var(--color-sig)', label: 'Download out-of-band' },
  derive: { color: 'var(--color-key)', label: 'Compute' },
  verify: { color: 'var(--color-tag)', label: 'Verify' },
};

const MIN_S = 60;
const MAX_S = 20 * YEAR;
const sliderToSeconds = (v: number) => MIN_S * Math.pow(MAX_S / MIN_S, v);
const secondsToSlider = (s: number) => Math.log(s / MIN_S) / Math.log(MAX_S / MIN_S);

export default function ReceiverStartup() {
  const [scenario, setScenario] = useState<Scenario>('hot');
  const [slider, setSlider] = useState(() => secondsToSlider(3 * 3600));
  const elapsed = sliderToSeconds(slider);

  const result = useMemo(() => computeStartup(scenario, elapsed), [scenario, elapsed]);
  const { index, setIndex, next, prev, reset, playing, togglePlay, atStart, atEnd } = useStepper(
    result.stages.length,
    1500,
  );

  // Restart the walkthrough when the scenario changes.
  useEffect(() => {
    reset();
  }, [scenario, reset]);

  const memory = useMemo(() => {
    const byId = Object.fromEntries(result.stages.map((s) => [s.id, s]));
    return [
      { key: 'merkle', label: 'Merkle root', stage: byId['merkle'] },
      { key: 'pk', label: 'Public key', stage: byId['pk'] },
      { key: 'kroot', label: 'TESLA KROOT', stage: byId['kroot'] },
    ];
  }, [result]);

  const degraded = result.effectiveScenario !== result.scenario;

  return (
    <div className="my-6 rounded-2xl border border-line bg-panel/40 p-4 sm:p-5">
      {/* Scenario selector */}
      <div className="grid gap-2 sm:grid-cols-3">
        {SCENARIOS.map((s) => {
          const active = s.id === scenario;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setScenario(s.id)}
              className={`rounded-xl border p-3 text-left transition-colors ${
                active ? 'border-brand bg-brand/10' : 'border-line bg-panel hover:border-line/80'
              }`}
            >
              <span className={`block text-sm font-bold ${active ? 'text-brand-bright' : 'text-ink'}`}>
                {s.name}
              </span>
              <span className="mt-0.5 block text-xs text-muted">{s.stored}</span>
            </button>
          );
        })}
      </div>

      {/* Time-off slider */}
      <div className="mt-4 rounded-xl border border-line bg-base/50 p-4">
        <div className="flex items-baseline justify-between">
          <label htmlFor="time-off" className="text-sm font-medium text-ink">
            Time since last use
          </label>
          <span className="font-mono text-lg font-semibold text-key">{formatDuration(elapsed)}</span>
        </div>
        <input
          id="time-off"
          type="range"
          min={0}
          max={1}
          step={0.001}
          value={slider}
          onChange={(e) => setSlider(parseFloat(e.target.value))}
          className="mt-2 w-full accent-[var(--color-brand)]"
        />
        <div className="mt-1 flex justify-between text-[10px] text-muted">
          <span>1 min</span>
          <span>1 hour</span>
          <span>1 day</span>
          <span>1 year</span>
          <span>20 years</span>
        </div>
      </div>

      {/* Metrics */}
      <div className="mt-4 grid grid-cols-3 gap-2">
        <Metric
          label="Effective start"
          value={result.effectiveScenario.toUpperCase()}
          accent={degraded ? 'var(--color-warn)' : 'var(--color-ok)'}
          hint={degraded ? `requested ${result.scenario}` : 'as requested'}
        />
        <Metric
          label="Time to 1st auth"
          value={`≤ ${formatDuration(result.ttfafSeconds)}`}
          accent="var(--color-brand)"
          hint="worst-case wait"
        />
        <Metric
          label="Chain re-anchor"
          value={result.hashSteps > 0 ? result.hashSteps.toLocaleString('en-US') : '—'}
          accent="var(--color-key)"
          hint={result.hashSteps > 0 ? 'hash steps' : 'one-time climb'}
        />
      </div>

      {/* Memory strip */}
      <div className="mt-4 grid grid-cols-3 gap-2">
        {memory.map((m) => {
          const status = m.stage?.status ?? 'acquire-sis';
          const meta = STATUS_META[status];
          const reused = status === 'reuse';
          return (
            <div
              key={m.key}
              className="rounded-lg border px-3 py-2"
              style={{ borderColor: meta.color + '55', background: meta.color + '10' }}
            >
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ background: meta.color }} />
                <span className="text-xs font-semibold text-ink">{m.label}</span>
              </div>
              <span className="mt-0.5 block text-[11px]" style={{ color: meta.color }}>
                {reused ? 'reused' : 'must (re)acquire'}
              </span>
            </div>
          );
        })}
      </div>

      {/* Pipeline */}
      <div className="mt-5">
        <StepControls
          index={index}
          count={result.stages.length}
          playing={playing}
          atStart={atStart}
          atEnd={atEnd}
          onPrev={prev}
          onNext={next}
          onReset={reset}
          onTogglePlay={togglePlay}
          onGoTo={setIndex}
          labels={result.stages.map((s) => s.title)}
        />

        <ol className="mt-4 space-y-2">
          {result.stages.map((stage, i) => {
            const meta = STATUS_META[stage.status];
            const reached = i <= index;
            const current = i === index;
            return (
              <li key={stage.id}>
                <motion.div
                  initial={false}
                  animate={{ opacity: reached ? 1 : 0.4, scale: current ? 1 : 0.997 }}
                  transition={{ duration: 0.25 }}
                  className={`rounded-xl border p-3 ${current ? 'bg-base/70' : 'bg-panel/40'}`}
                  style={{ borderColor: current ? meta.color : 'var(--color-line)' }}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold"
                      style={{ background: meta.color + '22', color: meta.color }}
                    >
                      {i + 1}
                    </span>
                    <span className="text-sm font-semibold text-ink">{stage.title}</span>
                    <span
                      className="ml-auto rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                      style={{ background: meta.color + '1e', color: meta.color }}
                    >
                      {meta.label}
                    </span>
                  </div>

                  <AnimatePresence initial={false}>
                    {current && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22 }}
                        className="overflow-hidden"
                      >
                        <p className="mt-2 text-sm text-ink/90">{stage.detail}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <Cite doc={stage.doc} section={stage.section} />
                          {stage.meta && (
                            <span
                              className="rounded px-2 py-0.5 font-mono text-[11px] font-semibold"
                              style={{ background: 'var(--color-key)' + '1e', color: 'var(--color-key)' }}
                            >
                              {stage.meta}
                            </span>
                          )}
                          {stage.waitSeconds && stage.status === 'acquire-sis' && (
                            <span className="rounded bg-panel2 px-2 py-0.5 text-[11px] text-muted">
                              reception window ≤ {formatDuration(stage.waitSeconds)}
                            </span>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </li>
            );
          })}
        </ol>

        {atEnd && result.notes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 rounded-xl border border-warn/40 bg-warn/5 p-3"
          >
            <p className="mb-1 text-xs font-bold uppercase tracking-wide text-warn">What the time slider changed</p>
            <ul className="list-disc space-y-1 pl-5 text-sm text-ink/90">
              {result.notes.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          </motion.div>
        )}
      </div>

      <p className="mt-4 text-xs text-muted">
        Reception windows (DSM-KROOT ≤ 1 h, DSM-PKR ≤ 13 h), the 30 s subframe and the one-hash-per-subframe
        re-anchoring are taken from the documents. The chain / key / tree renewal thresholds behind the slider are
        illustrative and chosen only to show the correct ordering (chain renews far more often than keys, which renew
        far more often than the Merkle tree).
      </p>
    </div>
  );
}

function Metric({
  label,
  value,
  accent,
  hint,
}: {
  label: string;
  value: string;
  accent: string;
  hint: string;
}) {
  return (
    <div className="rounded-xl border border-line bg-base/50 p-3 text-center">
      <div className="text-[10px] font-semibold uppercase tracking-wide text-muted">{label}</div>
      <div className="mt-0.5 font-mono text-lg font-bold" style={{ color: accent }}>
        {value}
      </div>
      <div className="text-[10px] text-muted">{hint}</div>
    </div>
  );
}
