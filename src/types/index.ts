/**
 * Core types for the actuarial model
 */

export type Sex = 'male' | 'female';

export type RelationType =
  | 'mother'
  | 'father'
  | 'grandmother_maternal'
  | 'grandmother_paternal'
  | 'grandfather_maternal'
  | 'grandfather_paternal'
  | 'partner'
  | 'friend'
  | 'other_family'
  | 'other';

export type FrequencyPeriod = 'weekly' | 'monthly' | 'quarterly' | 'yearly';

export interface PersonInput {
  age: number;
  sex: Sex;
  country: string;
}

export interface RelationshipInput {
  you: PersonInput;
  them: PersonInput;
  relationType: RelationType;
  visitsPerYear: number;
  frequencyPeriod?: FrequencyPeriod;
  timesPerPeriod?: number;
}

export interface LifeTableEntry {
  age: number;
  /** Probability of death between age x and x+1 */
  qx: number;
  /** Probability of surviving to age x */
  lx: number;
  /** Life expectancy at age x (years remaining) */
  ex: number;
}

export interface LifeTable {
  country: string;
  sex: Sex;
  year: number;
  entries: LifeTableEntry[];
}

export interface SurvivalProbability {
  year: number;
  youAlive: number;
  themAlive: number;
  bothAlive: number;
}

export interface CalculationResult {
  expectedVisits: number;
  expectedVisitsRange: {
    p25: number;
    p50: number;
    p75: number;
  };
  yearsWithBothAlive: {
    expected: number;
    min: number;
    max: number;
  };
  yearByYearSurvival: SurvivalProbability[];
  assumptions: {
    youLifeExpectancy: number;
    themLifeExpectancy: number;
    dataSource: string;
    dataYear: number;
  };
}
