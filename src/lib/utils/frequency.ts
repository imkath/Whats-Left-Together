/**
 * Frequency conversion utilities
 */

import type { FrequencyPeriod } from '@/types';

/**
 * Get maximum number of times per period
 *
 * Each cap is bounded so that `max × annualMultiplier` never exceeds 365 visits
 * per year (the annual ceiling enforced by relationshipInputSchema). Monthly is
 * therefore 30 (30 × 12 = 360), not 31, since 31 × 12 = 372 would overflow that
 * ceiling and be rejected on submit.
 */
export function getMaxTimesForPeriod(period: FrequencyPeriod): number {
  switch (period) {
    case 'weekly':
      return 7;
    case 'monthly':
      return 30;
    case 'quarterly':
      return 90;
    case 'yearly':
      return 365;
    default:
      return 365;
  }
}

/**
 * Convert period + times to annual visits
 */
export function calculateVisitsPerYear(period: FrequencyPeriod, times: number): number {
  switch (period) {
    case 'weekly':
      return times * 52;
    case 'monthly':
      return times * 12;
    case 'quarterly':
      return times * 4;
    case 'yearly':
      return times;
    default:
      return times;
  }
}
