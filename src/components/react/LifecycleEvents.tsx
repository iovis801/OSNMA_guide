import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Cite from './Cite';
import { LIFECYCLE_EVENTS, type Nmas } from '@/data/lifecycle';
import { colorVar, type ColorToken } from './colors';

/**
 * Lifecycle event explorer: pick an event and walk its phases, seeing the NMA
 * status and the exact receiver actions, with the official test-vector folder
 * that exercises each phase.
 */
function nmasColor(n: Nmas): string {
  return n === "Don't use" ? 'var(--color-bad)' : 'var(--color-ok)';
}

export default function LifecycleEvents() {
  const [id, setId] = useState(LIFECYCLE_EVENTS[0].id);
  const event = LIFECYCLE_EVENTS.find((e) => e.id === id)!;
  const accent = colorVar(event.color as ColorToken);

  return (
    <div className="my-6 rounded-2xl border border-line bg-panel/40 p-4 sm:p-5">
      {/* event tabs */}
      <div className="flex flex-wrap gap-2">
        {LIFECYCLE_EVENTS.map((e) => {
          const active = e.id === id;
          const c = colorVar(e.color as ColorToken);
          return (
            <button
              key={e.id}
              type="button"
              onClick={() => setId(e.id)}
              className="rounded-lg border px-3 py-1.5 text-sm font-semibold transition-colors"
              style={{
                borderColor: active ? c : 'var(--color-line)',
                background: active ? c + '1e' : 'var(--color-panel)',
                color: active ? c : 'var(--color-muted)',
              }}
            >
              {e.abbr}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={event.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {/* header */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-bold" style={{ color: accent }}>
              {event.name}
            </h3>
            <span className="rounded-full px-2 py-0.5 text-[11px] font-semibold" style={{ background: accent + '1e', color: accent }}>
              CPKS = {event.cpks}
            </span>
            <span className="ml-auto">
              <Cite doc="rxg" section={event.section} />
            </span>
          </div>
          <p className="mt-1 text-sm text-ink/90">{event.summary}</p>

          {/* phase timeline */}
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {event.phases.map((phase, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="flex flex-col rounded-xl border border-line bg-base/60 p-3"
              >
                <div className="mb-2 flex items-center gap-2">
                  <span className="grid h-6 w-6 place-items-center rounded-full text-xs font-bold" style={{ background: accent + '22', color: accent }}>
                    {i + 1}
                  </span>
                  <span className="text-sm font-semibold text-ink">{phase.label}</span>
                </div>

                <div className="mb-2 flex flex-wrap items-center gap-1.5">
                  <span
                    className="rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                    style={{ background: nmasColor(phase.nmas) + '1e', color: nmasColor(phase.nmas) }}
                  >
                    {phase.nmas}
                  </span>
                  {phase.testVector && (
                    <span className="rounded bg-panel2 px-2 py-0.5 font-mono text-[10px] text-muted">{phase.testVector}</span>
                  )}
                </div>

                <ul className="space-y-1.5 text-sm text-ink/85">
                  {phase.actions.map((a, j) => (
                    <li key={j} className="flex gap-1.5">
                      <span style={{ color: accent }}>›</span>
                      <span>{a}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      <p className="mt-4 text-xs text-muted">
        The <span className="font-mono">step</span> chips name the official test-vector folders that reproduce each
        phase, so an implementation can replay the exact transitions.
      </p>
    </div>
  );
}
