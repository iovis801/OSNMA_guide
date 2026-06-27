/** Presentational controls for a useStepper-driven walkthrough. */
interface Props {
  index: number;
  count: number;
  playing: boolean;
  atStart: boolean;
  atEnd: boolean;
  onPrev: () => void;
  onNext: () => void;
  onReset: () => void;
  onTogglePlay: () => void;
  onGoTo?: (i: number) => void;
  labels?: string[];
}

export default function StepControls({
  index,
  count,
  playing,
  atStart,
  atEnd,
  onPrev,
  onNext,
  onReset,
  onTogglePlay,
  onGoTo,
  labels,
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={onTogglePlay}
        className="inline-flex items-center gap-1.5 rounded-md bg-brand px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-brand-bright"
      >
        {playing ? (
          <>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" /><rect x="14" y="5" width="4" height="14" /></svg>
            Pause
          </>
        ) : (
          <>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 4 20 12 6 20" /></svg>
            {atEnd ? 'Replay' : 'Play'}
          </>
        )}
      </button>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onPrev}
          disabled={atStart}
          className="grid h-8 w-8 place-items-center rounded-md border border-line text-muted transition-colors hover:text-ink disabled:opacity-30"
          aria-label="Previous step"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={atEnd}
          className="grid h-8 w-8 place-items-center rounded-md border border-line text-muted transition-colors hover:text-ink disabled:opacity-30"
          aria-label="Next step"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
        </button>
        <button
          type="button"
          onClick={onReset}
          className="grid h-8 w-8 place-items-center rounded-md border border-line text-muted transition-colors hover:text-ink"
          aria-label="Reset"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" /></svg>
        </button>
      </div>

      <span className="ml-1 font-mono text-xs text-muted">
        Step {index + 1} / {count}
      </span>

      <div className="flex flex-1 items-center justify-end gap-1">
        {Array.from({ length: count }).map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onGoTo?.(i)}
            title={labels?.[i]}
            aria-label={labels?.[i] ?? `Go to step ${i + 1}`}
            className="h-1.5 rounded-full transition-all"
            style={{
              width: i === index ? 22 : 10,
              background: i <= index ? 'var(--color-brand)' : 'var(--color-line)',
            }}
          />
        ))}
      </div>
    </div>
  );
}
