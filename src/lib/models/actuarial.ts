/**
 * Actuarial model for calculating expected encounters
 * Based on life tables from UN WPP-2024
 *
 * METHODOLOGY:
 *
 * 1. For each person, we obtain:
 *    - Current age: a
 *    - Residual life expectancy: eₐ (expected remaining years, conditional on being alive at age a)
 *
 * 2. Time horizon where both are alive:
 *    T ≈ min(e_you + a_you, e_them + a_them) - current_year
 *
 * 3. Expected number of visits:
 *    E[visits] = Σ(t=0 to T) f_t × P(both alive in year t)
 *    where:
 *    - f_t = visits per year in year t (assumed constant)
 *    - P(both alive in t) = P(you alive in t) × P(them alive in t)
 *
 * References:
 * - UN World Population Prospects 2024 (life tables by age, sex, country)
 * - Preston et al. (2001), "Demography: Measuring and Modeling Population Processes"
 */

import type { LifeTable, RelationshipInput, CalculationResult, SurvivalProbability } from '@/types';

/**
 * Get life expectancy at a given age from life table
 */
export function getLifeExpectancy(lifeTable: LifeTable, age: number): number {
  // Find the exact age or interpolate
  const entry = lifeTable.entries.find((e) => e.age === Math.floor(age));

  if (!entry) {
    // If age exceeds table, assume minimal remaining life
    return 0;
  }

  return entry.ex;
}

/**
 * Calculate survival probability from age a to age a+t
 * Using the survival function: l(a+t) / l(a)
 */
export function getSurvivalProbability(
  lifeTable: LifeTable,
  currentAge: number,
  yearsFromNow: number
): number {
  const currentAgeFloor = Math.floor(currentAge);
  const futureAge = currentAgeFloor + yearsFromNow;

  const currentEntry = lifeTable.entries.find((e) => e.age === currentAgeFloor);
  const futureEntry = lifeTable.entries.find((e) => e.age === futureAge);

  if (!currentEntry || !futureEntry) {
    return 0;
  }

  // Survival probability = lx at future age / lx at current age
  return futureEntry.lx / currentEntry.lx;
}

/**
 * Calculate expected encounters between two people
 *
 * This is the CORE calculation of the entire project.
 */
export function calculateExpectedEncounters(
  input: RelationshipInput,
  yourLifeTable: LifeTable,
  theirLifeTable: LifeTable
): CalculationResult {
  const { you, them, visitsPerYear } = input;

  // 1. Get life expectancies
  const youLifeExpectancy = getLifeExpectancy(yourLifeTable, you.age);
  const themLifeExpectancy = getLifeExpectancy(theirLifeTable, them.age);

  // 2. Maximum years to consider (when the first person is expected to die)
  const yourExpectedDeathAge = you.age + youLifeExpectancy;
  const theirExpectedDeathAge = them.age + themLifeExpectancy;
  const maxYears = Math.min(yourExpectedDeathAge - you.age, theirExpectedDeathAge - them.age);

  // 3. Year-by-year survival probabilities
  const yearByYearSurvival: SurvivalProbability[] = [];
  let expectedVisits = 0;

  for (let t = 0; t <= Math.ceil(maxYears); t++) {
    const youAlive = getSurvivalProbability(yourLifeTable, you.age, t);
    const themAlive = getSurvivalProbability(theirLifeTable, them.age, t);
    const bothAlive = youAlive * themAlive;

    yearByYearSurvival.push({
      year: t,
      youAlive,
      themAlive,
      bothAlive,
    });

    // Expected visits in year t = frequency × P(both alive)
    expectedVisits += visitsPerYear * bothAlive;
  }

  // 4. Calculate uncertainty ranges
  // NOTE: These are heuristic approximations, NOT statistical confidence intervals.
  // The ±30% range reflects typical variation in visit frequency due to:
  // - Life changes (moves, health issues, schedule conflicts)
  // - Year-to-year variability in actual meetings
  // - Uncertainty in life expectancy predictions
  // Future improvement: implement Monte Carlo simulation for proper intervals.
  const expectedVisitsRange = {
    p25: Math.round(expectedVisits * 0.7), // Conservative: accounts for reduced frequency
    p50: Math.round(expectedVisits),
    p75: Math.round(expectedVisits * 1.3), // Optimistic: assumes maintained frequency
  };

  // 5. Years with both alive (weighted by survival probability)
  const yearsWithBothAlive = {
    expected: yearByYearSurvival.reduce((sum, y) => sum + y.bothAlive, 0),
    min: Math.floor(maxYears * 0.5),
    max: Math.ceil(maxYears),
  };

  return {
    expectedVisits: Math.round(expectedVisits),
    expectedVisitsRange,
    yearsWithBothAlive,
    yearByYearSurvival,
    assumptions: {
      youLifeExpectancy,
      themLifeExpectancy,
      dataSource: 'UN World Population Prospects 2024',
      dataYear: 2024,
    },
  };
}

/**
 * Calculate what percentage of total lifetime together has already passed
 * Based on typical time-use data (from Our World in Data)
 */
export function calculateTimeAlreadySpent(yourAge: number, relationType: string): number {
  // Simplified model: most time with parents/grandparents happens before age 20
  // This is based on American Time Use Survey data

  // Parent/grandparent relations typically peak around age 18
  const parentRelations = [
    'mother',
    'father',
    'grandmother_maternal',
    'grandmother_paternal',
    'grandfather_maternal',
    'grandfather_paternal',
  ];

  const typicalPeakAge = parentRelations.includes(relationType) ? 18 : 15;

  if (yourAge <= typicalPeakAge) {
    return yourAge / typicalPeakAge;
  }

  // After peak age, asymptotic approach to ~95% spent
  const yearsAfterPeak = yourAge - typicalPeakAge;
  return 0.7 + 0.25 * (1 - Math.exp(-yearsAfterPeak / 10));
}
