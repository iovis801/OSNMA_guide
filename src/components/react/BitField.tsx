import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { BitFieldSpec } from '@/data/types';
import { getTable } from '@/data/tables';
import { colorVar, type ColorToken } from './colors';

/**
 * Interactive bit-level layout. Each field is a segment whose width is dampened
 * (sqrt of bit count) so 2-bit fields stay readable next to 512-bit ones.
 * Selecting a segment reveals its description and, when relevant, the value table
 * that decodes it.
 */
interface Props {
  spec: BitFieldSpec;
}

function segWidth(bits: number | 'var'): number {
  const n = bits === 'var' ? 16 : bits;
  return Math.max(2.2, Math.sqrt(n));
}

export default function BitField({ spec }: Props) {
  const [selected, setSelected] = useState<number | null>(0);
  const sel = selected !== null ? spec.fields[selected] : null;
  const selTable = sel?.tableId ? getTable(sel.tableId) : undefined;

  return (
    <div className="my-5 rounded-xl border border-line bg-panel/50 p-4">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h4 className="text-sm font-semibold text-ink">{spec.title}</h4>
        <span className="font-mono text-xs text-muted">{spec.totalBits}</span>
      </div>

      <div className="overflow-x-auto pb-1">
        <div className="flex min-w-max gap-1" role="list" aria-label={`${spec.title} fields`}>
          {spec.fields.map((f, i) => {
            const active = i === selected;
            const c = colorVar(f.color as ColorToken);
            return (
              <button
                key={i}
                type="button"
                role="listitem"
                onClick={() => setSelected(i)}
                style={{
                  flexGrow: segWidth(f.bits),
                  flexBasis: 0,
                  borderColor: active ? c : 'var(--color-line)',
                  background: active ? c + '24' : c + '10',
                }}
                className="group min-w-[44px] rounded-md border px-1.5 py-2 text-center transition-colors"
              >
                <span className="block truncate text-[11px] font-semibold" style={{ color: c }}>
                  {f.name}
                </span>
                <span className="mt-0.5 block font-mono text-[10px] text-muted">
                  {f.bits === 'var' ? 'var' : f.bits}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {sel && (
          <motion.div
            key={selected}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="mt-3 rounded-lg border border-line bg-base/60 p-3"
          >
            <div className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: colorVar(sel.color as ColorToken) }}
              />
              <span className="text-sm font-semibold text-ink">{sel.name}</span>
              {sel.abbr && <span className="text-xs text-muted">({sel.abbr})</span>}
              <span className="ml-auto font-mono text-xs text-muted">
                {sel.bits === 'var' ? 'variable length' : `${sel.bits} bits`}
              </span>
            </div>
            <p className="mt-1.5 text-sm text-ink/90">{sel.desc}</p>

            {selTable && (
              <div className="mt-3 overflow-x-auto rounded-md border border-line">
                <table className="w-full border-collapse text-xs">
                  <thead>
                    <tr className="text-left text-muted">
                      {selTable.cols.map((col) => (
                        <th key={col} className="border-b border-line px-2.5 py-1.5 font-semibold">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {selTable.rows.map((row, ri) => (
                      <tr key={ri} className="border-b border-line/50 last:border-0">
                        {row.map((cell, ci) => (
                          <td
                            key={ci}
                            className={
                              ci === 0
                                ? 'px-2.5 py-1.5 font-mono text-brand-bright'
                                : 'px-2.5 py-1.5 text-ink/85'
                            }
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
