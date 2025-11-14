/**
 * Data access layer for life tables
 */

import type { LifeTable, Sex } from '@/types';
import countries from './countries.json';

export interface Country {
  code: string;
  name: string;
  nameEs: string;
  region: string;
  hasData: boolean;
}

/**
 * Get list of available countries
 */
export function getAvailableCountries(): Country[] {
  return countries.filter((c) => c.hasData);
}

/**
 * Load life table for a given country and sex
 *
 * In production, this would fetch from a database or API.
 * For now, we'll use sample data or load from static files.
 */
export async function getLifeTable(countryCode: string, sex: Sex): Promise<LifeTable> {
  // TODO: In production, fetch from actual data files
  // For now, return sample Chilean data as fallback

  try {
    const response = await fetch(`/data/life-tables/${countryCode}_${sex}.json`);
    if (!response.ok) {
      throw new Error(`Life table not found for ${countryCode} ${sex}`);
    }
    return await response.json();
  } catch {
    console.warn(`Failed to load life table for ${countryCode} ${sex}, using sample data`);
    return getSampleLifeTable(countryCode, sex);
  }
}

/**
 * Generate sample life table based on typical patterns
 * This is a TEMPORARY fallback until real WPP-2024 data is integrated
 *
 * IMPORTANT: This uses simplified Gompertz-Makeham mortality model.
 * Real implementation MUST use actual UN data.
 */
function getSampleLifeTable(countryCode: string, sex: Sex): LifeTable {
  const entries = [];

  // Typical life expectancy at birth (rough estimates)
  const baseLifeExpectancy = sex === 'female' ? 82 : 77;

  // Generate entries for ages 0-100
  for (let age = 0; age <= 100; age++) {
    // Simplified mortality model (not accurate, just for structure)
    let qx: number;

    if (age < 1) {
      qx = 0.005; // Infant mortality
    } else if (age < 10) {
      qx = 0.0002; // Very low child mortality
    } else if (age < 20) {
      qx = 0.0005; // Low young adult mortality
    } else {
      // Gompertz law: mortality increases exponentially with age
      const a = 0.0001;
      const b = 0.085;
      qx = Math.min(1, a * Math.exp(b * (age - 20)));
    }

    // Calculate lx (survivors out of 100,000)
    let lx: number;
    if (age === 0) {
      lx = 100000;
    } else {
      const prevEntry = entries[age - 1];
      lx = prevEntry.lx * (1 - prevEntry.qx);
    }

    // Rough estimate of remaining life expectancy
    const ex = Math.max(0, baseLifeExpectancy - age);

    entries.push({ age, qx, lx, ex });
  }

  return {
    country: countryCode,
    sex,
    year: 2024,
    entries,
  };
}

/**
 * Get country name in specified language
 */
export function getCountryName(countryCode: string, locale: 'es' | 'en'): string {
  const country = countries.find((c) => c.code === countryCode);
  if (!country) return countryCode;

  return locale === 'es' ? country.nameEs : country.name;
}
