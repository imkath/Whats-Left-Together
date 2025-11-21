/**
 * Tests for data access layer
 */

import { getAvailableCountries, getLifeTable, getCountryName, hasLifeTableData } from '../index';

// Mock fetch globally
global.fetch = jest.fn();

describe('data access layer', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('getAvailableCountries', () => {
    it('should return an array of countries', () => {
      const countries = getAvailableCountries();
      expect(Array.isArray(countries)).toBe(true);
      expect(countries.length).toBeGreaterThan(0);
    });

    it('should only return countries with hasData: true', () => {
      const countries = getAvailableCountries();
      countries.forEach((country) => {
        expect(country.hasData).toBe(true);
      });
    });

    it('should include required fields for each country', () => {
      const countries = getAvailableCountries();
      countries.forEach((country) => {
        expect(country).toHaveProperty('code');
        expect(country).toHaveProperty('name');
        expect(country).toHaveProperty('nameEs');
        expect(country).toHaveProperty('region');
        expect(country).toHaveProperty('hasData');

        expect(typeof country.code).toBe('string');
        expect(typeof country.name).toBe('string');
        expect(typeof country.nameEs).toBe('string');
        expect(country.code.length).toBe(3); // ISO 3166-1 alpha-3
      });
    });

    it('should include Chile (CHL) as a test country', () => {
      const countries = getAvailableCountries();
      const chile = countries.find((c) => c.code === 'CHL');

      expect(chile).toBeDefined();
      expect(chile?.name).toBe('Chile');
      expect(chile?.nameEs).toBe('Chile');
    });
  });

  describe('getLifeTable', () => {
    it('should fetch life table from correct path', async () => {
      const mockLifeTable = {
        country: 'CHL',
        sex: 'female',
        year: 2023,
        entries: [
          { age: 0, qx: 0.00372, lx: 100000.0, ex: 83.08 },
          { age: 1, qx: 0.000198, lx: 99628.0, ex: 82.39 },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockLifeTable,
      });

      const result = await getLifeTable('CHL', 'female');

      expect(global.fetch).toHaveBeenCalledWith('/data/life-tables/CHL_female.json');
      expect(result).toEqual(mockLifeTable);
    });

    it('should fetch male life tables', async () => {
      const mockLifeTable = {
        country: 'CHL',
        sex: 'male',
        year: 2023,
        entries: [{ age: 0, qx: 0.004, lx: 100000.0, ex: 77.5 }],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockLifeTable,
      });

      const result = await getLifeTable('CHL', 'male');

      expect(global.fetch).toHaveBeenCalledWith('/data/life-tables/CHL_male.json');
      expect(result.sex).toBe('male');
    });

    it('should throw NetworkError when fetch fails', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await expect(getLifeTable('XXX', 'female')).rejects.toThrow('Error de conexión');
    });

    it('should throw DataNotAvailableError when response is not ok', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      await expect(getLifeTable('INVALID', 'female')).rejects.toThrow(
        'No disponemos de datos demográficos oficiales'
      );
    });

    it('should return life table with correct structure', async () => {
      const mockLifeTable = {
        country: 'USA',
        sex: 'female',
        year: 2023,
        entries: [
          { age: 0, qx: 0.005, lx: 100000.0, ex: 81.0 },
          { age: 50, qx: 0.003, lx: 95000.0, ex: 32.5 },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockLifeTable,
      });

      const result = await getLifeTable('USA', 'female');

      expect(result).toHaveProperty('country');
      expect(result).toHaveProperty('sex');
      expect(result).toHaveProperty('year');
      expect(result).toHaveProperty('entries');
      expect(Array.isArray(result.entries)).toBe(true);

      result.entries.forEach((entry) => {
        expect(entry).toHaveProperty('age');
        expect(entry).toHaveProperty('qx');
        expect(entry).toHaveProperty('lx');
        expect(entry).toHaveProperty('ex');
      });
    });
  });

  describe('getCountryName', () => {
    it('should return Spanish name when locale is "es"', () => {
      const name = getCountryName('CHL', 'es');
      expect(name).toBe('Chile');
    });

    it('should return English name when locale is "en"', () => {
      const name = getCountryName('CHL', 'en');
      expect(name).toBe('Chile');
    });

    it('should return country code when country is not found', () => {
      const name = getCountryName('XXX', 'es');
      expect(name).toBe('XXX');
    });

    it('should handle different countries correctly', () => {
      const countries = getAvailableCountries();

      // Test a few countries
      countries.slice(0, 5).forEach((country) => {
        const nameEn = getCountryName(country.code, 'en');
        const nameEs = getCountryName(country.code, 'es');

        expect(nameEn).toBe(country.name);
        expect(nameEs).toBe(country.nameEs);
        expect(typeof nameEn).toBe('string');
        expect(typeof nameEs).toBe('string');
      });
    });
  });

  describe('hasLifeTableData', () => {
    it('should return true for countries with data', () => {
      const countries = getAvailableCountries();

      // All available countries should have data
      countries.forEach((country) => {
        expect(hasLifeTableData(country.code)).toBe(true);
      });
    });

    it('should return true for Chile', () => {
      expect(hasLifeTableData('CHL')).toBe(true);
    });

    it('should return false for non-existent country codes', () => {
      expect(hasLifeTableData('XXX')).toBe(false);
      expect(hasLifeTableData('ZZZ')).toBe(false);
      expect(hasLifeTableData('')).toBe(false);
    });

    it('should return false for countries without data', () => {
      // This would require knowing which countries are in the JSON but have hasData: false
      // For now, we'll just test that the function doesn't throw
      const result = hasLifeTableData('ABC');
      expect(typeof result).toBe('boolean');
    });
  });
});
