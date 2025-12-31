/**
 * Tests for actuarial calculations
 */

import {
  getLifeExpectancy,
  getSurvivalProbability,
  calculateExpectedEncounters,
  calculateTimeAlreadySpent,
} from '../actuarial';
import type { LifeTable, RelationshipInput } from '@/types';

// Generate a complete life table for testing (realistic mortality pattern)
// This simulates a typical female life table from age 0 to 100
function generateTestLifeTable(): LifeTable {
  const entries = [];
  let lx = 100000;

  for (let age = 0; age <= 100; age++) {
    // Realistic qx pattern: U-shaped with infant mortality, low in young adults, increasing with age
    let qx: number;
    if (age === 0) {
      qx = 0.004; // Infant mortality
    } else if (age < 5) {
      qx = 0.0003;
    } else if (age < 15) {
      qx = 0.0001;
    } else if (age < 30) {
      qx = 0.0005;
    } else if (age < 50) {
      qx = 0.001 + (age - 30) * 0.0001;
    } else if (age < 70) {
      qx = 0.003 + (age - 50) * 0.001;
    } else if (age < 90) {
      qx = 0.025 + (age - 70) * 0.005;
    } else {
      qx = 0.15 + (age - 90) * 0.03;
    }
    qx = Math.min(qx, 1.0);

    // Calculate life expectancy (simplified approximation)
    const ex = Math.max(0, 85 - age + (age < 30 ? 5 : 0));

    entries.push({
      age,
      qx,
      lx,
      ex,
    });

    // Update survivors for next age
    lx = lx * (1 - qx);
  }

  return {
    country: 'TEST',
    sex: 'female',
    year: 2023,
    entries,
  };
}

const sampleLifeTable: LifeTable = generateTestLifeTable();

// Simplified life table for basic tests (only has specific ages)
const simplifiedLifeTable: LifeTable = {
  country: 'CHL',
  sex: 'female',
  year: 2023,
  entries: [
    { age: 0, qx: 0.00372, lx: 100000.0, ex: 83.08 },
    { age: 1, qx: 0.000198, lx: 99628.0, ex: 82.39 },
    { age: 30, qx: 0.000567, lx: 98721.5, ex: 53.42 },
    { age: 40, qx: 0.001234, lx: 97234.2, ex: 43.89 },
    { age: 50, qx: 0.002456, lx: 95123.8, ex: 34.56 },
    { age: 55, qx: 0.003789, lx: 93456.1, ex: 30.12 },
    { age: 60, qx: 0.005234, lx: 91234.5, ex: 25.78 },
    { age: 70, qx: 0.012345, lx: 85123.4, ex: 17.45 },
    { age: 80, qx: 0.034567, lx: 72345.6, ex: 10.23 },
    { age: 90, qx: 0.123456, lx: 45678.9, ex: 5.12 },
    { age: 100, qx: 1.0, lx: 12345.6, ex: 2.5 },
  ],
};

describe('actuarial model', () => {
  describe('getLifeExpectancy', () => {
    it('should return correct life expectancy for exact age', () => {
      const ex = getLifeExpectancy(simplifiedLifeTable, 30);
      expect(ex).toBe(53.42);
    });

    it('should return correct life expectancy for age 0', () => {
      const ex = getLifeExpectancy(simplifiedLifeTable, 0);
      expect(ex).toBe(83.08);
    });

    it('should return 0 for age beyond table', () => {
      const ex = getLifeExpectancy(simplifiedLifeTable, 110);
      expect(ex).toBe(0);
    });

    it('should floor fractional ages', () => {
      const ex = getLifeExpectancy(simplifiedLifeTable, 30.7);
      expect(ex).toBe(53.42); // Should use age 30
    });
  });

  describe('getSurvivalProbability', () => {
    it('should return 1.0 for year 0 (current age)', () => {
      const prob = getSurvivalProbability(simplifiedLifeTable, 30, 0);
      expect(prob).toBe(1.0);
    });

    it('should return probability < 1 for future years', () => {
      const prob = getSurvivalProbability(simplifiedLifeTable, 30, 10);
      expect(prob).toBeLessThan(1.0);
      expect(prob).toBeGreaterThan(0.9); // Should be high for 10 years at age 30
    });

    it('should calculate correct survival probability using lx ratio', () => {
      // From age 30 to age 40: lx(40)/lx(30)
      const prob = getSurvivalProbability(simplifiedLifeTable, 30, 10);
      const expected = 97234.2 / 98721.5;
      expect(prob).toBeCloseTo(expected, 5);
    });

    it('should return 0 when future age exceeds table', () => {
      const prob = getSurvivalProbability(simplifiedLifeTable, 90, 20);
      expect(prob).toBe(0);
    });

    it('should handle fractional current ages', () => {
      const prob = getSurvivalProbability(simplifiedLifeTable, 30.5, 10);
      expect(prob).toBeGreaterThan(0);
      expect(prob).toBeLessThan(1);
    });
  });

  describe('calculateExpectedEncounters', () => {
    // Use the complete life table (with all ages 0-100) for Monte Carlo tests
    const yourLifeTable: LifeTable = sampleLifeTable;
    const theirLifeTable: LifeTable = {
      ...sampleLifeTable,
      entries: sampleLifeTable.entries.map((e) => ({
        ...e,
        // Slightly higher mortality for variety
        qx: Math.min(e.qx * 1.1, 1.0),
      })),
    };

    const input: RelationshipInput = {
      you: { age: 30, sex: 'female', country: 'TEST' },
      them: { age: 55, sex: 'female', country: 'TEST' },
      relationType: 'mother',
      visitsPerYear: 12,
      frequencyPeriod: 'monthly',
      timesPerPeriod: 1,
    };

    it('should calculate expected visits', () => {
      const result = calculateExpectedEncounters(input, yourLifeTable, theirLifeTable);

      expect(result.expectedVisits).toBeGreaterThan(0);
      expect(result.expectedVisits).toBeLessThan(12 * 100); // Max 100 years
      expect(Number.isInteger(result.expectedVisits)).toBe(true);
    });

    it('should calculate uncertainty ranges using Monte Carlo', () => {
      const result = calculateExpectedEncounters(input, yourLifeTable, theirLifeTable);

      // Monte Carlo should produce a distribution where p25 <= p50 <= p75
      expect(result.expectedVisitsRange.p25).toBeLessThanOrEqual(result.expectedVisitsRange.p50);
      expect(result.expectedVisitsRange.p50).toBe(result.expectedVisits);
      expect(result.expectedVisitsRange.p75).toBeGreaterThanOrEqual(result.expectedVisitsRange.p50);

      // The range should be non-trivial (not all same value, unless edge case)
      // With realistic mortality, there should be variance
      if (result.expectedVisits > 0) {
        expect(result.expectedVisitsRange.p75 - result.expectedVisitsRange.p25).toBeGreaterThan(0);
      }
    });

    it('should calculate years with both alive', () => {
      const result = calculateExpectedEncounters(input, yourLifeTable, theirLifeTable);

      expect(result.yearsWithBothAlive.expected).toBeGreaterThan(0);
      expect(result.yearsWithBothAlive.min).toBeLessThanOrEqual(result.yearsWithBothAlive.max);
    });

    it('should generate year-by-year survival data', () => {
      const result = calculateExpectedEncounters(input, yourLifeTable, theirLifeTable);

      expect(result.yearByYearSurvival).toBeInstanceOf(Array);
      expect(result.yearByYearSurvival.length).toBeGreaterThan(0);

      // First year should have probability close to 1
      expect(result.yearByYearSurvival[0].bothAlive).toBeCloseTo(1.0, 1);

      // Each entry should have required fields
      result.yearByYearSurvival.forEach((entry) => {
        expect(entry).toHaveProperty('year');
        expect(entry).toHaveProperty('youAlive');
        expect(entry).toHaveProperty('themAlive');
        expect(entry).toHaveProperty('bothAlive');

        // bothAlive should be product of individual probabilities
        expect(entry.bothAlive).toBeCloseTo(entry.youAlive * entry.themAlive, 5);
      });
    });

    it('should include assumptions in result', () => {
      const result = calculateExpectedEncounters(input, yourLifeTable, theirLifeTable);

      expect(result.assumptions).toHaveProperty('youLifeExpectancy');
      expect(result.assumptions).toHaveProperty('themLifeExpectancy');
      expect(result.assumptions).toHaveProperty('dataSource');
      expect(result.assumptions).toHaveProperty('dataYear');

      // Life expectancy comes from the generated table
      expect(result.assumptions.youLifeExpectancy).toBeGreaterThan(0);
      expect(result.assumptions.dataSource).toBe('UN World Population Prospects 2024');
    });

    it('should scale with visits per year', () => {
      const input12: RelationshipInput = { ...input, visitsPerYear: 12 };
      const input24: RelationshipInput = { ...input, visitsPerYear: 24 };

      const result12 = calculateExpectedEncounters(input12, yourLifeTable, theirLifeTable);
      const result24 = calculateExpectedEncounters(input24, yourLifeTable, theirLifeTable);

      // Double visits should approximately double expected encounters
      // Allow for some variance due to Monte Carlo
      expect(result24.expectedVisits).toBeGreaterThan(result12.expectedVisits * 1.8);
      expect(result24.expectedVisits).toBeLessThan(result12.expectedVisits * 2.2);
    });

    it('should handle zero visits per year', () => {
      const inputZero: RelationshipInput = { ...input, visitsPerYear: 0 };
      const result = calculateExpectedEncounters(inputZero, yourLifeTable, theirLifeTable);

      expect(result.expectedVisits).toBe(0);
      expect(result.expectedVisitsRange.p25).toBe(0);
      expect(result.expectedVisitsRange.p50).toBe(0);
      expect(result.expectedVisitsRange.p75).toBe(0);
    });

    it('should handle very old ages', () => {
      const inputOld: RelationshipInput = {
        you: { age: 80, sex: 'female', country: 'TEST' },
        them: { age: 90, sex: 'female', country: 'TEST' },
        relationType: 'mother',
        visitsPerYear: 12,
      };

      const result = calculateExpectedEncounters(inputOld, yourLifeTable, theirLifeTable);

      expect(result.expectedVisits).toBeGreaterThanOrEqual(0);
      expect(result.expectedVisits).toBeLessThan(200); // Should be relatively low
    });

    it('should produce reproducible results with same inputs (seeded RNG)', () => {
      const result1 = calculateExpectedEncounters(input, yourLifeTable, theirLifeTable);
      const result2 = calculateExpectedEncounters(input, yourLifeTable, theirLifeTable);

      // Same inputs should produce identical results due to seeded RNG
      expect(result1.expectedVisits).toBe(result2.expectedVisits);
      expect(result1.expectedVisitsRange.p25).toBe(result2.expectedVisitsRange.p25);
      expect(result1.expectedVisitsRange.p75).toBe(result2.expectedVisitsRange.p75);
    });
  });

  describe('calculateTimeAlreadySpent', () => {
    it('should return 0 at age 0', () => {
      const percentage = calculateTimeAlreadySpent(0, 'mother');
      expect(percentage).toBe(0);
    });

    describe('parent/grandparent relations (peak age 18)', () => {
      it('should return proportion before peak age for mother', () => {
        const percentage = calculateTimeAlreadySpent(9, 'mother');
        // At age 9, with peak at 18: 9/18 = 0.5
        expect(percentage).toBeCloseTo(0.5, 2);
      });

      it('should return 1.0 at peak age for father', () => {
        const percentage = calculateTimeAlreadySpent(18, 'father');
        // At exact peak (18): 18/18 = 1.0
        expect(percentage).toBe(1.0);
      });

      it('should use asymptotic formula after peak for grandparents', () => {
        const percentage19 = calculateTimeAlreadySpent(19, 'grandmother_maternal');
        // After peak (18), yearsAfterPeak = 1
        // 0.7 + 0.25 * (1 - e^(-1/10)) ≈ 0.7238
        expect(percentage19).toBeCloseTo(0.7238, 2);
      });

      it('should work for all parent/grandparent relation types', () => {
        const relations = [
          'mother',
          'father',
          'grandmother_maternal',
          'grandmother_paternal',
          'grandfather_maternal',
          'grandfather_paternal',
        ];

        relations.forEach((relation) => {
          const percentage = calculateTimeAlreadySpent(10, relation);
          // All should use peak age 18: 10/18 ≈ 0.556
          expect(percentage).toBeCloseTo(10 / 18, 2);
        });
      });
    });

    describe('non-parent relations (peak age 15)', () => {
      it('should return proportion before peak age for friend', () => {
        const percentage = calculateTimeAlreadySpent(10, 'friend');
        // At age 10, with peak at 15: 10/15 ≈ 0.667
        expect(percentage).toBeCloseTo(10 / 15, 2);
      });

      it('should return 1.0 at peak age for partner', () => {
        const percentage = calculateTimeAlreadySpent(15, 'partner');
        // At exact peak (15): 15/15 = 1.0
        expect(percentage).toBe(1.0);
      });

      it('should use asymptotic formula after peak for other', () => {
        const percentage16 = calculateTimeAlreadySpent(16, 'other');
        // After peak (15), yearsAfterPeak = 1
        // 0.7 + 0.25 * (1 - e^(-1/10)) ≈ 0.7238
        expect(percentage16).toBeCloseTo(0.7238, 2);
      });
    });

    describe('different peak ages for different relation types', () => {
      it('should use peak age 18 for parents but 15 for friends', () => {
        const motherAt10 = calculateTimeAlreadySpent(10, 'mother');
        const friendAt10 = calculateTimeAlreadySpent(10, 'friend');

        // Mother: 10/18 ≈ 0.556
        // Friend: 10/15 ≈ 0.667
        expect(motherAt10).toBeCloseTo(10 / 18, 2);
        expect(friendAt10).toBeCloseTo(10 / 15, 2);
        expect(friendAt10).toBeGreaterThan(motherAt10);
      });
    });

    describe('asymptotic behavior after peak', () => {
      it('should asymptotically approach ~95% well after peak', () => {
        const percentage30 = calculateTimeAlreadySpent(30, 'mother');
        const percentage40 = calculateTimeAlreadySpent(40, 'mother');
        const percentage50 = calculateTimeAlreadySpent(50, 'mother');

        expect(percentage30).toBeGreaterThan(0.7);
        expect(percentage40).toBeGreaterThan(percentage30);
        expect(percentage50).toBeGreaterThan(percentage40);
        expect(percentage50).toBeLessThan(0.95);
      });
    });
  });
});
