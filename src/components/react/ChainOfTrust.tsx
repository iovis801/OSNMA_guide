import { motion } from 'motion/react';
import Cite from './Cite';
import StepControls from './StepControls';
import { useStepper } from './useStepper';

/**
 * End-to-end chain of trust. Each link is authenticated by the one above it,
 * from the out-of-band Merkle root down to live navigation data.
 */
interface Link {
  id: string;
  label: string;
  carrier: string;
  color: string;
  by: string; // how this link is authenticated by the one above
  detail: string;
  doc: 'icd' | 'rxg';
  section: string;
}

const LINKS: Link[] = [
  {
    id: 'merkle',
    label: 'Merkle root',
    carrier: 'out-of-band (GSC server)',
    color: 'var(--color-hash)',
    by: 'Anchor of trust',
    detail: 'Downloaded out-of-band and verified through a PKI certificate chain. Everything below is ultimately tied to this single 256-bit value.',
    doc: 'rxg',
    section: '5.1',
  },
  {
    id: 'pk',
    label: 'Public key',
    carrier: 'DSM-PKR',
    color: 'var(--color-sig)',
    by: 'authenticated by the Merkle tree',
    detail: 'The key is hashed into a leaf and climbed to the root using the carried sibling nodes. If the recomputed root matches, the key is genuine.',
    doc: 'icd',
    section: '6.2',
  },
  {
    id: 'kroot',
    label: 'KROOT',
    carrier: 'DSM-KROOT',
    color: 'var(--color-sig)',
    by: 'authenticated by an ECDSA signature',
    detail: 'The root key of the TESLA chain is signed with the operator’s private key. The receiver verifies that signature with the public key just authenticated.',
    doc: 'icd',
    section: '3.2.3',
  },
  {
    id: 'keys',
    label: 'TESLA keys',
    carrier: 'MACK (key field)',
    color: 'var(--color-key)',
    by: 'authenticated by the one-way chain',
    detail: 'Each disclosed key is hashed backward to KROOT. A match proves it belongs to the chain — without any further signature.',
    doc: 'rxg',
    section: '5.4',
  },
  {
    id: 'tags',
    label: 'Tags (MACs)',
    carrier: 'MACK (tags)',
    color: 'var(--color-tag)',
    by: 'computed with a TESLA key',
    detail: 'Each tag is a truncated MAC over navigation data, made with a key that was secret when the tag was sent and disclosed only later.',
    doc: 'icd',
    section: '4.2',
  },
  {
    id: 'nav',
    label: 'Navigation data',
    carrier: 'I/NAV message',
    color: 'var(--color-ok)',
    by: 'authenticated when the MAC matches',
    detail: 'The receiver recomputes the tag over the buffered data with the verified key. A match authenticates the data — and a fix you can trust.',
    doc: 'rxg',
    section: '5.5',
  },
];

export default function ChainOfTrust() {
  const { index, setIndex, next, prev, reset, playing, togglePlay, atStart, atEnd } = useStepper(LINKS.length, 1700);

  return (
    <div className="my-6 rounded-2xl border border-line bg-panel/40 p-4 sm:p-5">
      <div className="mb-4">
        <StepControls
          index={index}
          count={LINKS.length}
          playing={playing}
          atStart={atStart}
          atEnd={atEnd}
          onPrev={prev}
          onNext={next}
          onReset={reset}
          onTogglePlay={togglePlay}
          onGoTo={setIndex}
          labels={LINKS.map((l) => l.label)}
        />
      </div>

      <ol className="space-y-0">
        {LINKS.map((link, i) => {
          const reached = i <= index;
          const current = i === index;
          return (
            <li key={link.id}>
              {i > 0 && (
                <div className="flex items-center gap-2 py-1 pl-5">
                  <motion.div
                    initial={false}
                    animate={{ opacity: reached ? 1 : 0.25, height: 22 }}
                    className="w-px"
                    style={{ background: reached ? link.color : 'var(--color-line)' }}
                  />
                  <motion.span
                    initial={false}
                    animate={{ opacity: reached ? 1 : 0.3 }}
                    className="text-[11px] font-medium"
                    style={{ color: reached ? link.color : 'var(--color-muted)' }}
                  >
                    ↓ {link.by}
                  </motion.span>
                </div>
              )}
              <motion.div
                initial={false}
                animate={{ opacity: reached ? 1 : 0.4, scale: current ? 1 : 0.998 }}
                transition={{ duration: 0.25 }}
                className="rounded-xl border p-3"
                style={{
                  borderColor: current ? link.color : 'var(--color-line)',
                  background: current ? link.color + '12' : 'var(--color-panel)',
                }}
              >
                <div className="flex items-center gap-2.5">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: link.color }} />
                  <span className="text-sm font-bold" style={{ color: link.color }}>
                    {link.label}
                  </span>
                  <span className="ml-auto rounded-full bg-base/60 px-2 py-0.5 font-mono text-[10px] text-muted">
                    {link.carrier}
                  </span>
                </div>
                {current && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="overflow-hidden">
                    <p className="mt-2 text-sm text-ink/90">{link.detail}</p>
                    <div className="mt-2">
                      <Cite doc={link.doc} section={link.section} />
                    </div>
                  </motion.div>
                )}
              </motion.div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
