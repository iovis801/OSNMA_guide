import { motion } from 'motion/react';
import Cite from './Cite';
import StepControls from './StepControls';
import { useStepper } from './useStepper';

/**
 * Animates how the 15 pages of a 30 s subframe each contribute 8 bits to the
 * HKROOT stream and 32 bits to the MACK stream, building a 120-bit HKROOT
 * message and a 480-bit MACK message (SIS ICD sections 2-4).
 */
const PAGES = 15;

function hkrootRole(page: number): string {
  if (page === 1) return 'NMA Header (8 bits)';
  if (page === 2) return 'DSM Header (8 bits)';
  return `DSM block bits (byte ${page})`;
}

export default function SubframeBuilder() {
  const { index, setIndex, next, prev, reset, playing, togglePlay, atStart, atEnd } = useStepper(PAGES, 700);
  const filled = index + 1; // pages received so far (1..15)
  const hk = filled * 8;
  const mack = filled * 32;

  return (
    <div className="my-6 rounded-2xl border border-line bg-panel/40 p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between text-xs text-muted">
        <span>One 30 s subframe = 15 pages</span>
        <span className="font-mono">page {filled} / 15</span>
      </div>

      {/* 15 page cells */}
      <div className="flex flex-wrap gap-1.5">
        {Array.from({ length: PAGES }).map((_, i) => {
          const on = i <= index;
          const current = i === index;
          return (
            <motion.div
              key={i}
              animate={{ opacity: on ? 1 : 0.3, scale: current ? 1.08 : 1 }}
              transition={{ duration: 0.2 }}
              className="flex-1 rounded-md border p-1 text-center"
              style={{
                minWidth: 38,
                borderColor: current ? 'var(--color-brand)' : on ? 'var(--color-line)' : 'var(--color-line)',
                background: on ? 'var(--color-brand)' + '14' : 'transparent',
              }}
              title={`Page ${i + 1}`}
            >
              <div className="text-[9px] text-muted">p{i + 1}</div>
              <div className="mx-auto mt-0.5 h-1.5 w-full rounded-full" style={{ background: 'var(--color-sig)', opacity: on ? 1 : 0.25 }} />
              <div className="mx-auto mt-0.5 h-1.5 w-full rounded-full" style={{ background: 'var(--color-tag)', opacity: on ? 1 : 0.25 }} />
            </motion.div>
          );
        })}
      </div>
      <div className="mt-1.5 flex gap-4 text-[10px] text-muted">
        <span><span className="mr-1 inline-block h-2 w-2 rounded-full align-middle" style={{ background: 'var(--color-sig)' }} />HKROOT 8 b/page</span>
        <span><span className="mr-1 inline-block h-2 w-2 rounded-full align-middle" style={{ background: 'var(--color-tag)' }} />MACK 32 b/page</span>
      </div>

      {/* accumulation bars */}
      <div className="mt-4 space-y-3">
        <Bar label="HKROOT message" color="var(--color-sig)" value={hk} max={120} unit="bits" />
        <Bar label="MACK message" color="var(--color-tag)" value={mack} max={480} unit="bits" />
      </div>

      <div className="mt-4">
        <StepControls
          index={index}
          count={PAGES}
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

      <motion.div key={index} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="mt-3 rounded-xl border border-line bg-base/60 p-3 text-sm">
        <p className="text-ink/90">
          Page {filled}: contributes <span className="font-mono text-sig">{hkrootRole(filled)}</span> to HKROOT and{' '}
          <span className="font-mono text-tag">32 bits</span> to MACK.
        </p>
        {atEnd && (
          <p className="mt-1 text-ink/90">
            Complete: the 15 pages have assembled a <strong className="text-sig">120-bit HKROOT message</strong> and a{' '}
            <strong className="text-tag">480-bit MACK message</strong> — one subframe of OSNMA.
          </p>
        )}
        <div className="mt-2"><Cite doc="icd" section="2" /></div>
      </motion.div>
    </div>
  );
}

function Bar({ label, color, value, max, unit }: { label: string; color: string; value: number; max: number; unit: string }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs">
        <span className="font-medium text-ink">{label}</span>
        <span className="font-mono text-muted">
          {value} / {max} {unit}
        </span>
      </div>
      <div className="h-3 overflow-hidden rounded-full border border-line bg-base">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          animate={{ width: `${(value / max) * 100}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>
    </div>
  );
}
