'use client';

import { useMemo } from 'react';
import type { SurvivalProbability } from '@/types';

interface VisitGridProps {
  survival: SurvivalProbability[];
  visitsPerYear: number;
  themAge: number;
  startYear: number;
  /** Rows below this probability are summarized instead of drawn. */
  minProbability?: number;
  ariaLabel: (info: { years: number; from: number; start: number; end: number }) => string;
  moreLabel: (count: number) => string;
  unitLabel: (n: number) => string;
}

const MAX_COLUMNS = 52;

// Deterministic 0..1 noise so the same inputs always draw the same grid.
function noise(row: number, col: number) {
  const x = Math.sin(row * 12.9898 + col * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

/**
 * One row per year, one square per visit. In each row, the share of lit squares
 * equals the probability that both people are alive that year, so the lit total
 * is the average number of visits left. Squares go out from the right edge with
 * some scatter, the same way the logo's "ther" breaks apart.
 */
export default function VisitGrid({
  survival,
  visitsPerYear,
  themAge,
  startYear,
  minProbability = 0.03,
  ariaLabel,
  moreLabel,
  unitLabel,
}: VisitGridProps) {
  const unit = visitsPerYear > MAX_COLUMNS ? Math.ceil(visitsPerYear / MAX_COLUMNS) : 1;
  const cols = Math.max(1, Math.round(visitsPerYear / unit));

  const { rows, hiddenYears } = useMemo(() => {
    const all = survival.map((s, i) => {
      const nextP = survival[i + 1]?.bothAlive ?? s.bothAlive;
      return { year: s.year, p: (s.bothAlive + nextP) / 2 };
    });
    const visible = all.filter((r) => r.p >= minProbability);
    const drawn = visible.map(({ year, p }) => {
      const lit = Math.round(cols * p);
      // Rank columns: further right and noisier goes out first.
      const order = Array.from({ length: cols }, (_, c) => ({
        c,
        score: 0.55 * (c / cols) + 0.45 * noise(year, c),
      })).sort((a, b) => a.score - b.score);
      const on = new Set(order.slice(0, lit).map((o) => o.c));
      return { year, p, on };
    });
    return { rows: drawn, hiddenYears: all.length - visible.length };
  }, [survival, cols, minProbability]);

  if (rows.length === 0) return null;

  // Squares shrink to fit narrow screens but never grow past `size`.
  const size = cols > 24 ? 12 : cols > 12 ? 16 : 20;
  const gap = cols > 24 ? 2 : 4;
  const rowMax = cols * size + (cols - 1) * gap;
  const first = Math.round(rows[0].p * 100);
  const last = Math.round(rows[rows.length - 1].p * 100);

  return (
    <div className="min-w-0">
      <div
        role="img"
        aria-label={ariaLabel({ years: rows.length, from: startYear, start: first, end: last })}
        className="grid gap-y-[3px] items-center"
        style={{ gridTemplateColumns: 'auto minmax(0, 1fr)', rowGap: gap }}
      >
        {rows.map((row, i) => {
          const labelled = i === 0 || row.year % 5 === 0;
          return (
            <div key={row.year} className="contents">
              <div
                aria-hidden="true"
                className="pr-3 text-[11px] leading-none text-right tabular-nums text-neutral-500 dark:text-neutral-400 whitespace-nowrap"
              >
                {labelled && (
                  <>
                    <span className="text-neutral-900 dark:text-neutral-100">
                      {startYear + row.year}
                    </span>
                    <span className="ml-1.5">{themAge + row.year}</span>
                  </>
                )}
              </div>
              <div
                aria-hidden="true"
                className="grid w-full"
                style={{
                  gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                  gap,
                  maxWidth: rowMax,
                }}
              >
                {Array.from({ length: cols }, (_, c) => (
                  <span
                    key={c}
                    className={`visit-square block aspect-square rounded-[2px] ${
                      row.on.has(c) ? 'bg-presence' : 'bg-neutral-200/70 dark:bg-neutral-800'
                    }`}
                    style={{ animationDelay: `${Math.min(i * 30, 900)}ms` }}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
      {(hiddenYears > 0 || unit > 1) && (
        <p className="mt-3 text-sm text-neutral-500 dark:text-neutral-400">
          {unit > 1 && unitLabel(unit)} {hiddenYears > 0 && moreLabel(hiddenYears)}
        </p>
      )}
    </div>
  );
}
