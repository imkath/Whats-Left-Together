/**
 * Frequency conversion utilities
 */

import type { FrequencyPeriod } from '@/types';

/**
 * Get maximum number of times per period
 */
export function getMaxTimesForPeriod(period: FrequencyPeriod): number {
  switch (period) {
    case 'weekly':
      return 7;
    case 'monthly':
      return 31;
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
