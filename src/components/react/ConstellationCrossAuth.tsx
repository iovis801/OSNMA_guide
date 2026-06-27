import { useMemo } from 'react';
import { motion } from 'motion/react';
import Cite from './Cite';
import StepControls from './StepControls';
import { useStepper } from './useStepper';

/**
 * The OSNMA-transmitting subset is not static, and tags cross-authenticate.
 * Each epoch a different subset transmits OSNMA (gold). Their Tag0 self-authenticates
 * their own data (PRN_A = PRN_D); other tags cross-authenticate other satellites'
 * data (PRN_A authenticates PRN_D). Together they cover the whole constellation.
 */
const SATS = ['E02', 'E03', 'E07', 'E08', 'E11', 'E12', 'E19', 'E24'];

interface Epoch {
  tx: number[];
  cross: [number, number][];
}
const EPOCHS: Epoch[] = [
  { tx: [0, 2, 4], cross: [[0, 1], [2, 3], [4, 5], [4, 6], [0, 7]] },
  { tx: [1, 3, 6], cross: [[1, 0], [3, 2], [6, 5], [3, 4], [1, 7]] },
  { tx: [0, 5, 7], cross: [[0, 1], [0, 2], [5, 3], [5, 4], [7, 6]] },
  { tx: [2, 4, 6], cross: [[2, 0], [2, 1], [4, 3], [4, 5], [6, 7]] },
];

const W = 600;
const H = 250;
const R = 175;
const CX = 300;
const CY = 205;
const POS = SATS.map((_, i) => {
  const a = Math.PI * (1 - i / (SATS.length - 1));
  return { x: CX + R * Math.cos(a), y: CY - R * Math.sin(a) };
});

export default function ConstellationCrossAuth() {
  const { index, setIndex, next, prev, reset, playing, togglePlay, atStart, atEnd } = useStepper(EPOCHS.length, 2200);
  const epoch = EPOCHS[index];
  const txSet = useMemo(() => new Set(epoch.tx), [epoch]);

  return (
    <div className="my-6 rounded-2xl border border-line bg-panel/40 p-4 sm:p-5">
      <div className="mb-2 flex items-center justify-between text-xs">
        <span className="font-semibold text-muted">Epoch {index + 1} / {EPOCHS.length}</span>
        <span className="text-muted">
          <span className="font-mono text-key">{epoch.tx.length}</span> of {SATS.length} satellites transmit OSNMA
        </span>
      </div>

      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[520px]" role="img" aria-label="OSNMA constellation cross-authentication">
          <defs>
            <marker id="arrow-tag" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" fill="var(--color-tag)" />
            </marker>
          </defs>

          {/* cross-authentication arrows */}
          {epoch.cross.map(([from, to], i) => (
            <motion.line
              key={`${index}-${from}-${to}`}
              x1={POS[from].x}
              y1={POS[from].y}
              x2={POS[to].x}
              y2={POS[to].y}
              stroke="var(--color-tag)"
              strokeWidth={1.6}
              markerEnd="url(#arrow-tag)"
              initial={{ opacity: 0, pathLength: 0 }}
              animate={{ opacity: 0.8, pathLength: 1 }}
              transition={{ duration: 0.5, delay: 0.15 + i * 0.08 }}
            />
          ))}

          {/* satellites */}
          {SATS.map((s, i) => {
            const tx = txSet.has(i);
            const color = tx ? 'var(--color-key)' : 'var(--color-ok)';
            return (
              <g key={s}>
                {/* self-auth loop for transmitters */}
                {tx && (
                  <motion.path
                    d={`M ${POS[i].x - 7} ${POS[i].y - 12} A 9 9 0 1 1 ${POS[i].x + 7} ${POS[i].y - 12}`}
                    fill="none"
                    stroke="var(--color-key)"
                    strokeWidth={1.6}
                    markerEnd="url(#arrow-tag)"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.9 }}
                    style={{ filter: 'none' }}
                  />
                )}
                <motion.circle
                  cx={POS[i].x}
                  cy={POS[i].y}
                  r={13}
                  animate={{ scale: tx ? 1.1 : 1 }}
                  style={{
                    fill: tx ? 'var(--color-key)' : 'var(--color-panel)',
                    stroke: color,
                    strokeWidth: 2,
                    transformOrigin: 'center',
                    transformBox: 'fill-box',
                  }}
                />
                <text x={POS[i].x} y={POS[i].y + 1} textAnchor="middle" dominantBaseline="middle" fontSize="8" fontWeight="700" fill={tx ? '#0a0e17' : 'var(--color-ink)'}>
                  {s}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* legend */}
      <div className="mt-1 flex flex-wrap gap-3 text-[11px] text-muted">
        <span><span className="mr-1 inline-block h-2.5 w-2.5 rounded-full align-middle" style={{ background: 'var(--color-key)' }} />transmits OSNMA · self-auth (PRN_A = PRN_D)</span>
        <span><span className="mr-1 inline-block h-2.5 w-2.5 rounded-full align-middle" style={{ border: '2px solid var(--color-ok)' }} />authenticated by cross-auth</span>
        <span><span className="mr-1 inline-block h-2 w-4 align-middle" style={{ background: 'var(--color-tag)' }} />cross-auth tag (PRN_A → PRN_D)</span>
      </div>

      <div className="mt-4">
        <StepControls
          index={index}
          count={EPOCHS.length}
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

      <motion.div key={index} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-4 rounded-xl border border-line bg-base/60 p-3 text-sm text-ink/90">
        This epoch, <strong className="text-key">{epoch.tx.map((i) => SATS[i]).join(', ')}</strong> carry OSNMA. Each
        self-authenticates its own data and cross-authenticates others, so all {SATS.length} satellites in view end up
        authenticated — even those not transmitting OSNMA. Step forward and the transmitting set changes.
        <span className="ml-1 inline-block align-middle"><Cite doc="icd" section="4.2.1" /></span>
      </motion.div>
    </div>
  );
}
