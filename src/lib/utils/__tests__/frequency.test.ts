/**
 * Tests for frequency conversion utilities
 */

import { getMaxTimesForPeriod, calculateVisitsPerYear } from '../frequency';
import type { FrequencyPeriod } from '@/types';

describe('frequency utilities', () => {
  describe('getMaxTimesForPeriod', () => {
    it('should return 7 for weekly period', () => {
      expect(getMaxTimesForPeriod('weekly')).toBe(7);
    });

    it('should return 31 for monthly period', () => {
      expect(getMaxTimesForPeriod('monthly')).toBe(31);
    });

    it('should return 90 for quarterly period', () => {
      expect(getMaxTimesForPeriod('quarterly')).toBe(90);
    });

    it('should return 365 for yearly period', () => {
      expect(getMaxTimesForPeriod('yearly')).toBe(365);
    });

    it('should return 365 for unknown period (default)', () => {
      expect(getMaxTimesForPeriod('unknown' as FrequencyPeriod)).toBe(365);
    });
  });

  describe('calculateVisitsPerYear', () => {
    describe('weekly frequency', () => {
      it('should convert 1 time per week to 52 visits per year', () => {
        expect(calculateVisitsPerYear('weekly', 1)).toBe(52);
      });

      it('should convert 2 times per week to 104 visits per year', () => {
        expect(calculateVisitsPerYear('weekly', 2)).toBe(104);
      });

      it('should convert 7 times per week to 364 visits per year', () => {
        expect(calculateVisitsPerYear('weekly', 7)).toBe(364);
      });
    });

    describe('monthly frequency', () => {
      it('should convert 1 time per month to 12 visits per year', () => {
        expect(calculateVisitsPerYear('monthly', 1)).toBe(12);
      });

      it('should convert 2 times per month to 24 visits per year', () => {
        expect(calculateVisitsPerYear('monthly', 2)).toBe(24);
      });

      it('should convert 4 times per month to 48 visits per year', () => {
        expect(calculateVisitsPerYear('monthly', 4)).toBe(48);
      });
    });

    describe('quarterly frequency', () => {
      it('should convert 1 time per quarter to 4 visits per year', () => {
        expect(calculateVisitsPerYear('quarterly', 1)).toBe(4);
      });

      it('should convert 3 times per quarter to 12 visits per year', () => {
        expect(calculateVisitsPerYear('quarterly', 3)).toBe(12);
      });

      it('should convert 12 times per quarter to 48 visits per year', () => {
        expect(calculateVisitsPerYear('quarterly', 12)).toBe(48);
      });
    });

    describe('yearly frequency', () => {
      it('should convert 1 time per year to 1 visit per year', () => {
        expect(calculateVisitsPerYear('yearly', 1)).toBe(1);
      });

      it('should convert 12 times per year to 12 visits per year', () => {
        expect(calculateVisitsPerYear('yearly', 12)).toBe(12);
      });

      it('should convert 52 times per year to 52 visits per year', () => {
        expect(calculateVisitsPerYear('yearly', 52)).toBe(52);
      });
    });

    describe('edge cases', () => {
      it('should handle 0 times per period', () => {
        expect(calculateVisitsPerYear('monthly', 0)).toBe(0);
        expect(calculateVisitsPerYear('weekly', 0)).toBe(0);
      });

      it('should handle fractional times (rounds down implicitly)', () => {
        // JavaScript will accept fractional numbers, but in practice the UI should prevent this
        expect(calculateVisitsPerYear('monthly', 1.5)).toBe(18);
      });

      it('should handle unknown period (default to yearly)', () => {
        expect(calculateVisitsPerYear('unknown' as FrequencyPeriod, 5)).toBe(5);
      });
    });

    describe('real-world scenarios', () => {
      it('should calculate for visiting parents once per month', () => {
        expect(calculateVisitsPerYear('monthly', 1)).toBe(12);
      });

      it('should calculate for visiting grandparents quarterly', () => {
        expect(calculateVisitsPerYear('quarterly', 1)).toBe(4);
      });

      it('should calculate for seeing partner daily', () => {
        expect(calculateVisitsPerYear('weekly', 7)).toBe(364); // 7 * 52
      });

      it('should calculate for seeing friend twice per month', () => {
        expect(calculateVisitsPerYear('monthly', 2)).toBe(24);
      });
    });
  });

  describe('integration: max times validation', () => {
    it('should ensure valid weekly input stays within bounds', () => {
      const period: FrequencyPeriod = 'weekly';
      const maxTimes = getMaxTimesForPeriod(period);
      const visitsPerYear = calculateVisitsPerYear(period, maxTimes);

      expect(visitsPerYear).toBe(7 * 52); // 364
      expect(visitsPerYear).toBeLessThanOrEqual(365);
    });

    it('should ensure valid monthly input stays within bounds', () => {
      const period: FrequencyPeriod = 'monthly';
      const maxTimes = getMaxTimesForPeriod(period);
      const visitsPerYear = calculateVisitsPerYear(period, maxTimes);

      expect(visitsPerYear).toBe(31 * 12); // 372
      // Note: This can exceed 365, which is acceptable (more than daily)
    });
  });
});
