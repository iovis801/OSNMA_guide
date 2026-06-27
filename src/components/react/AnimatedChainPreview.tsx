import { motion } from 'motion/react';

/**
 * Landing-hero animation: a pulse of trust flowing down the OSNMA chain,
 * from the out-of-band Merkle root all the way to authenticated navigation data.
 * Purely decorative; the full interactive version lives on the Chain of Trust page.
 */
const LINKS = [
  { label: 'Merkle root', sub: 'out-of-band', color: 'var(--color-hash)' },
  { label: 'Public key', sub: 'DSM-PKR', color: 'var(--color-sig)' },
  { label: 'KROOT', sub: 'DSM-KROOT signature', color: 'var(--color-sig)' },
  { label: 'TESLA keys', sub: 'one-way chain', color: 'var(--color-key)' },
  { label: 'Tags / MACs', sub: 'MACK', color: 'var(--color-tag)' },
  { label: 'Nav data', sub: 'authenticated', color: 'var(--color-ok)' },
];

export default function AnimatedChainPreview() {
  return (
    <div className="w-full overflow-x-auto py-2">
      <div className="flex min-w-max items-stretch gap-2">
        {LINKS.map((link, i) => (
          <div key={link.label} className="flex items-stretch gap-2">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.12, duration: 0.4 }}
              className="relative flex w-28 flex-col justify-center rounded-lg border px-3 py-2.5 text-center sm:w-32"
              style={{ borderColor: link.color + '66', background: link.color + '12' }}
            >
              <motion.span
                className="absolute inset-0 rounded-lg"
                style={{ boxShadow: `0 0 0 1px ${link.color}` }}
                animate={{ opacity: [0, 0.9, 0] }}
                transition={{
                  duration: 3,
                  times: [0, 0.5, 1],
                  repeat: Infinity,
                  delay: i * 0.5,
                  ease: 'easeInOut',
                }}
              />
              <span className="text-xs font-semibold text-ink sm:text-sm" style={{ color: link.color }}>
                {link.label}
              </span>
              <span className="mt-0.5 text-[10px] text-muted">{link.sub}</span>
            </motion.div>
            {i < LINKS.length - 1 && (
              <div className="flex items-center text-muted">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
