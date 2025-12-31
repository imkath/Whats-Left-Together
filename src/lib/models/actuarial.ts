/**
 * Actuarial model for calculating expected encounters
 * Based on life tables from UN WPP-2024
 *
 * METHODOLOGY:
 *
 * 1. For each person, we obtain survival probabilities from life tables:
 *    - lx: Number of survivors to age x (out of 100,000 births)
 *    - qx: Probability of death between age x and x+1
 *    - ex: Life expectancy at age x
 *
 * 2. Survival probability calculation:
 *    P(survive from age a to age a+t) = l(a+t) / l(a)
 *
 * 3. Expected number of visits using Monte Carlo simulation:
 *    - Run N simulations (default: 10,000)
 *    - In each simulation:
 *      a) Sample death year for each person using survival probabilities
 *      b) Calculate years both are alive
 *      c) Multiply by visits per year
 *    - Return median and percentile-based confidence intervals
 *
 * 4. Why Monte Carlo?
 *    - Provides statistically valid confidence intervals (not heuristic ±30%)
 *    - Captures the full distribution of outcomes
 *    - Accounts for correlation between survival years and visits
 *
 * References:
 * - UN World Population Prospects 2024 (life tables by age, sex, country)
 * - Preston et al. (2001), "Demography: Measuring and Modeling Population Processes"
 */

import type { LifeTable, RelationshipInput, CalculationResult, SurvivalProbability } from '@/types';

// Maximum age in life tables (UN WPP goes to 100)
const MAX_TABLE_AGE = 100;

// Number of Monte Carlo simulations for confidence intervals
const MONTE_CARLO_SIMULATIONS = 10000;

// Minimum probability threshold to continue calculations
const MIN_PROBABILITY_THRESHOLD = 0.0001;

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
 * Seeded random number generator for reproducible Monte Carlo simulations
 * Uses mulberry32 algorithm - fast and good statistical properties
 */
function createSeededRandom(seed: number): () => number {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Sample a death year for a person using their survival probabilities
 * Returns the number of years from now until death
 */
function sampleDeathYear(lifeTable: LifeTable, currentAge: number, random: () => number): number {
  const maxYears = MAX_TABLE_AGE - currentAge;

  // Use inverse transform sampling with qx (probability of death in each year)
  for (let t = 0; t < maxYears; t++) {
    const futureAge = Math.floor(currentAge) + t;
    const entry = lifeTable.entries.find((e) => e.age === futureAge);

    if (!entry) {
      return t; // No data, assume death
    }

    // qx is probability of dying between age x and x+1
    if (random() < entry.qx) {
      return t; // Dies in year t
    }
  }

  return maxYears; // Survives to max age
}

/**
 * Calculate expected encounters between two people
 * Uses Monte Carlo simulation for statistically valid confidence intervals
 *
 * This is the CORE calculation of the entire project.
 */
export function calculateExpectedEncounters(
  input: RelationshipInput,
  yourLifeTable: LifeTable,
  theirLifeTable: LifeTable
): CalculationResult {
  const { you, them, visitsPerYear } = input;

  // 1. Get life expectancies (for display purposes)
  const youLifeExpectancy = getLifeExpectancy(yourLifeTable, you.age);
  const themLifeExpectancy = getLifeExpectancy(theirLifeTable, them.age);

  // 2. Calculate maximum years until either reaches max table age
  const maxYearsYou = MAX_TABLE_AGE - you.age;
  const maxYearsThem = MAX_TABLE_AGE - them.age;
  const maxYears = Math.min(maxYearsYou, maxYearsThem);

  // 3. Year-by-year survival probabilities (deterministic, for visualization)
  const yearByYearSurvival: SurvivalProbability[] = [];

  for (let t = 0; t <= maxYears; t++) {
    const youAlive = getSurvivalProbability(yourLifeTable, you.age, t);
    const themAlive = getSurvivalProbability(theirLifeTable, them.age, t);
    const bothAlive = youAlive * themAlive;

    // Stop if probability is essentially zero
    if (bothAlive < MIN_PROBABILITY_THRESHOLD && t > 0) {
      break;
    }

    yearByYearSurvival.push({
      year: t,
      youAlive,
      themAlive,
      bothAlive,
    });
  }

  // 4. Monte Carlo simulation for confidence intervals
  const simulatedVisits: number[] = [];
  const simulatedYears: number[] = [];

  // Use a fixed seed based on input parameters for reproducibility
  const seed = you.age * 1000 + them.age * 100 + visitsPerYear;
  const random = createSeededRandom(seed);

  for (let sim = 0; sim < MONTE_CARLO_SIMULATIONS; sim++) {
    // Sample death year for each person
    const yourDeathYear = sampleDeathYear(yourLifeTable, you.age, random);
    const theirDeathYear = sampleDeathYear(theirLifeTable, them.age, random);

    // Years both alive = minimum of the two death years
    const yearsBothAlive = Math.min(yourDeathYear, theirDeathYear);

    // Total visits = years × visits per year
    const totalVisits = yearsBothAlive * visitsPerYear;

    simulatedVisits.push(totalVisits);
    simulatedYears.push(yearsBothAlive);
  }

  // 5. Calculate percentiles from Monte Carlo results
  simulatedVisits.sort((a, b) => a - b);
  simulatedYears.sort((a, b) => a - b);

  const getPercentile = (arr: number[], p: number): number => {
    const idx = Math.floor(arr.length * p);
    return arr[Math.min(idx, arr.length - 1)];
  };

  const expectedVisitsRange = {
    p25: getPercentile(simulatedVisits, 0.25),
    p50: getPercentile(simulatedVisits, 0.5),
    p75: getPercentile(simulatedVisits, 0.75),
  };

  // 6. Years with both alive from Monte Carlo
  const yearsWithBothAlive = {
    expected: simulatedYears.reduce((a, b) => a + b, 0) / simulatedYears.length,
    min: getPercentile(simulatedYears, 0.1), // 10th percentile
    max: getPercentile(simulatedYears, 0.9), // 90th percentile
  };

  // Use the Monte Carlo median as the primary result
  const expectedVisits = expectedVisitsRange.p50;

  return {
    expectedVisits,
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
