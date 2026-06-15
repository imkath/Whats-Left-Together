import { useEffect, useRef, useState } from 'react';

/**
 * Animates a number from 0 up to `target` (easeOutCubic). Used for the result
 * reveal so the count of remaining encounters ticks up instead of just landing.
 * Honors prefers-reduced-motion.
 */
export function useCountUp(target: number, durationMs = 1400): number {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canAnimate =
      typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function';
    const reduce =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!canAnimate || reduce || target <= 0) {
      setValue(target);
      return;
    }

    let start: number | null = null;
    const tick = (ts: number) => {
      if (start === null) start = ts;
      const p = Math.min((ts - start) / durationMs, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(target * eased));
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, durationMs]);

  return value;
}
