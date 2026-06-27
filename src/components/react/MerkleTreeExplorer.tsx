import { useMemo } from 'react';
import { motion } from 'motion/react';
import Cite from './Cite';
import StepControls from './StepControls';
import { useStepper } from './useStepper';
import { buildLeaf, computeRoot } from '@/data/crypto/merkle';
import { bytesToHex, shortHex } from '@/data/crypto/bytes';
import { MERKLE_TREE_1 } from '@/data/testvectors/merkle-tree-1';

/**
 * Merkle tree authentication on real EUSPA test-vector data (Merkle_tree_1).
 * Recomputes the root from leaf 0 and its sibling path and self-checks it against
 * the published root — the same check a receiver performs on a DSM-PKR.
 */

// Tree geometry: counts per level, leaves at the bottom.
const LEVEL_COUNTS = [16, 8, 4, 2, 1];
const W = 680;
const H = 250;
const yFor = (level: number) => H - 24 - level * ((H - 60) / 4);
const xFor = (level: number, i: number) => ((i + 0.5) * W) / LEVEL_COUNTS[level];

export default function MerkleTreeExplorer() {
  const t = MERKLE_TREE_1;
  const result = useMemo(() => {
    const leaf = buildLeaf(t.leaf.npkt, t.leaf.pkid, t.leaf.pointHex);
    return { leafHex: bytesToHex(leaf), ...computeRoot(t.leaf.index, leaf, t.siblings.map((s) => s.xHex), t.hashFunction) };
  }, [t]);

  // Steps: 0 build leaf, 1 hash leaf, 2..5 four climbs.
  const stepCount = 2 + result.steps.length;
  const { index, setIndex, next, prev, reset, playing, togglePlay, atStart, atEnd } = useStepper(stepCount, 1500);

  const rootMatches = result.root.toUpperCase() === t.root.toUpperCase();
  // Highest path level reached so far (0 = leaf level, 4 = root).
  const revealedPathLevel = index >= 1 ? index - 1 : -1;

  // Path and sibling node identity for leaf 0.
  const isPathNode = (level: number, i: number) => i === 0 && level <= 4;
  const isSibling = (level: number, i: number) =>
    (level === 0 && i === 1) || (level === 1 && i === 1) || (level === 2 && i === 1) || (level === 3 && i === 1);

  return (
    <div className="my-6 rounded-2xl border border-line bg-panel/40 p-4 sm:p-5">
      <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
        <span className="rounded bg-hash/15 px-2 py-0.5 font-semibold text-hash">Real test vector</span>
        <span className="text-muted">Merkle_tree_1 · PKID {t.leaf.pkid} · {t.hashFunction} · N = {t.n}</span>
      </div>

      {/* tree schematic */}
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${W} ${H}`} className="min-w-[560px] w-full" role="img" aria-label="Merkle tree verification path">
          {/* edges */}
          {LEVEL_COUNTS.slice(1).map((count, li) => {
            const level = li + 1;
            return Array.from({ length: count }).map((_, i) => {
              const childL = level - 1;
              return [2 * i, 2 * i + 1].map((ci) => {
                const onPath =
                  (isPathNode(level, i) && (isPathNode(childL, ci) || isSibling(childL, ci))) && revealedPathLevel >= childL;
                return (
                  <line
                    key={`${level}-${i}-${ci}`}
                    x1={xFor(level, i)}
                    y1={yFor(level)}
                    x2={xFor(childL, ci)}
                    y2={yFor(childL)}
                    stroke={onPath ? 'var(--color-ok)' : 'var(--color-line)'}
                    strokeWidth={onPath ? 1.8 : 0.6}
                    opacity={onPath ? 0.9 : 0.4}
                  />
                );
              });
            });
          })}

          {/* nodes */}
          {LEVEL_COUNTS.map((count, level) =>
            Array.from({ length: count }).map((_, i) => {
              const path = isPathNode(level, i);
              const sib = isSibling(level, i);
              const revealed = path ? revealedPathLevel >= level : sib ? revealedPathLevel >= level - 1 : false;
              const isRoot = level === 4;
              let fill = 'var(--color-line)';
              if (path) fill = isRoot ? 'var(--color-key)' : 'var(--color-ok)';
              else if (sib) fill = 'var(--color-key)';
              const r = isRoot ? 8 : path || sib ? 6 : 3.4;
              return (
                <motion.circle
                  key={`${level}-${i}`}
                  cx={xFor(level, i)}
                  cy={yFor(level)}
                  r={r}
                  initial={false}
                  animate={{
                    opacity: path || sib ? (revealed ? 1 : 0.35) : 0.3,
                    scale: revealed && (path || sib) ? 1 : 0.85,
                  }}
                  style={{ fill, transformOrigin: 'center', transformBox: 'fill-box' }}
                />
              );
            }),
          )}

          {/* labels */}
          <text x={xFor(4, 0)} y={yFor(4) - 12} textAnchor="middle" fontSize="10" fill="var(--color-key)" fontWeight="700">root</text>
          <text x={xFor(0, 0)} y={yFor(0) + 18} textAnchor="middle" fontSize="9" fill="var(--color-ok)">leaf 0</text>
        </svg>
      </div>

      <div className="mt-1 flex flex-wrap gap-3 text-[11px] text-muted">
        <span><span className="mr-1 inline-block h-2 w-2 rounded-full align-middle" style={{ background: 'var(--color-ok)' }} />path</span>
        <span><span className="mr-1 inline-block h-2 w-2 rounded-full align-middle" style={{ background: 'var(--color-key)' }} />sibling (carried in DSM-PKR)</span>
      </div>

      <div className="mt-4">
        <StepControls
          index={index}
          count={stepCount}
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
        className="mt-4 rounded-xl border border-line bg-base/60 p-4 text-sm"
      >
        {index === 0 && (
          <div>
            <p className="text-ink/90">
              Build the leaf <span className="font-mono">m₀ = NPKT ‖ NPKID ‖ NPK</span>: a 1-byte header
              (<span className="font-mono">0x11</span> for type 1 / id 1) followed by the compressed public key.
            </p>
            <HexLine label="m₀" value={result.leafHex} />
          </div>
        )}
        {index === 1 && (
          <div>
            <p className="text-ink/90">
              Hash the leaf: <span className="font-mono">x₀,₀ = SHA-256(m₀)</span>.
            </p>
            <HexLine label="x₀,₀" value={result.leafHash} color="var(--color-ok)" />
          </div>
        )}
        {index >= 2 && (
          <ClimbStep step={result.steps[index - 2]} level={index - 2} isRootStep={index === stepCount - 1} rootMatches={rootMatches} storedRoot={t.root} />
        )}
        <div className="mt-3 flex items-center gap-2">
          <Cite doc="rxg" section="5.1" />
          <Cite doc="icd" section="6.2" />
        </div>
      </motion.div>

      <p className="mt-3 text-xs text-muted">
        These are the real node values from the official Merkle tree. The recomputed root matches the published root,
        which is exactly how a receiver authenticates a public key carried in a DSM-PKR.
      </p>
    </div>
  );
}

function ClimbStep({
  step,
  level,
  isRootStep,
  rootMatches,
  storedRoot,
}: {
  step: { left: string; right: string; out: string; siblingOnRight: boolean };
  level: number;
  isRootStep: boolean;
  rootMatches: boolean;
  storedRoot: string;
}) {
  const outLabel = isRootStep ? 'root' : `x${level + 1},0`;
  return (
    <div>
      <p className="text-ink/90">
        Combine with the sibling and hash: <span className="font-mono">{outLabel} = SHA-256(left ‖ right)</span>. The
        node climbs one level toward the root.
      </p>
      <HexLine label="left" value={step.left} muted />
      <HexLine label="right" value={step.right} muted />
      <HexLine label={outLabel} value={step.out} color={isRootStep ? 'var(--color-key)' : 'var(--color-ok)'} />
      {isRootStep && (
        <div className="mt-2 rounded-lg border p-2" style={{ borderColor: rootMatches ? 'var(--color-ok)' : 'var(--color-bad)', background: (rootMatches ? 'var(--color-ok)' : 'var(--color-bad)') + '12' }}>
          <span className="text-sm font-semibold" style={{ color: rootMatches ? 'var(--color-ok)' : 'var(--color-bad)' }}>
            {rootMatches ? '✓ Matches the stored Merkle root — public key authenticated.' : '✗ Mismatch — key rejected.'}
          </span>
          <div className="mt-1 font-mono text-[10px] text-muted" title={storedRoot}>stored root: {shortHex(storedRoot, 10, 8)}</div>
        </div>
      )}
    </div>
  );
}

function HexLine({ label, value, color, muted }: { label: string; value: string; color?: string; muted?: boolean }) {
  return (
    <div className="mt-1 flex items-baseline gap-2">
      <span className="w-10 shrink-0 text-[10px] font-semibold text-muted">{label}</span>
      <span
        className="break-all font-mono text-[11px]"
        style={{ color: muted ? 'var(--color-muted)' : color ?? 'var(--color-ink)' }}
        title={value}
      >
        {shortHex(value, 16, 12)}
      </span>
    </div>
  );
}
