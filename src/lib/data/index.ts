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
 * Check if a country has life table data available
 */
export function hasLifeTableData(countryCode: string): boolean {
  const country = countries.find((c) => c.code === countryCode);
  return country?.hasData ?? false;
}

/**
 * Custom error class for network errors
 */
export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

/**
 * Custom error class for data not available errors
 */
export class DataNotAvailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DataNotAvailableError';
  }
}

/**
 * Load life table for a given country and sex
 *
 * Fetches life table data from static JSON files generated from UN WPP-2024.
 * Throws an error if the data is not available - we never use synthetic data
 * to maintain scientific accuracy and transparency.
 *
 * @param countryCode - ISO 3166-1 alpha-3 country code (e.g., 'CHL', 'USA')
 * @param sex - 'male' or 'female'
 * @returns Promise<LifeTable> - Life table with mortality data by age
 * @throws NetworkError if there's a connection issue
 * @throws DataNotAvailableError if life table data is not available
 */
export async function getLifeTable(countryCode: string, sex: Sex): Promise<LifeTable> {
  try {
    const response = await fetch(`/data/life-tables/${countryCode}_${sex}.json`);

    if (!response.ok) {
      throw new DataNotAvailableError('No disponemos de datos demográficos oficiales');
    }

    return await response.json();
  } catch (error) {
    // Re-throw custom errors as-is
    if (error instanceof DataNotAvailableError || error instanceof NetworkError) {
      throw error;
    }

    // Check for specific network error types
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new NetworkError('Error de conexión');
    }

    // For other errors (timeouts, etc.), treat as network error
    throw new NetworkError('Error de conexión');
  }
}

/**
 * Get country name in specified language
 */
export function getCountryName(countryCode: string, locale: 'es' | 'en'): string {
  const country = countries.find((c) => c.code === countryCode);
  if (!country) return countryCode;

  return locale === 'es' ? country.nameEs : country.name;
}
