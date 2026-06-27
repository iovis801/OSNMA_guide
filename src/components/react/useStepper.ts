import { useCallback, useEffect, useState } from 'react';

/**
 * Small state machine for animated step-by-step walkthroughs.
 * Handles clamping, optional autoplay, and stop-at-end behaviour.
 */
export function useStepper(count: number, autoMs = 1600) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);

  const atStart = index <= 0;
  const atEnd = index >= count - 1;

  const next = useCallback(() => {
    setIndex((i) => Math.min(count - 1, i + 1));
  }, [count]);

  const prev = useCallback(() => {
    setIndex((i) => Math.max(0, i - 1));
  }, []);

  const reset = useCallback(() => {
    setIndex(0);
    setPlaying(false);
  }, []);

  const goTo = useCallback(
    (i: number) => {
      setIndex(Math.max(0, Math.min(count - 1, i)));
    },
    [count],
  );

  const togglePlay = useCallback(() => {
    setPlaying((p) => {
      if (!p && atEnd) {
        setIndex(0);
        return true;
      }
      return !p;
    });
  }, [atEnd]);

  useEffect(() => {
    if (!playing) return;
    if (atEnd) {
      setPlaying(false);
      return;
    }
    const t = setTimeout(() => setIndex((i) => Math.min(count - 1, i + 1)), autoMs);
    return () => clearTimeout(t);
  }, [playing, index, atEnd, count, autoMs]);

  return { index, setIndex: goTo, next, prev, reset, playing, togglePlay, atStart, atEnd };
}
