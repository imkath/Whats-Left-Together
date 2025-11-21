/**
 * Tests for Results component
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Results from '../Results';
import type { RelationshipInput } from '@/types';

// Mock the data module
jest.mock('@/lib/data', () => {
  // Create NetworkError class inside the mock factory
  class NetworkError extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'NetworkError';
    }
  }

  return {
    getLifeTable: jest.fn(),
    getCountryName: jest.fn((code: string) => {
      const names: Record<string, string> = {
        CHL: 'Chile',
        USA: 'Estados Unidos',
      };
      return names[code] || code;
    }),
    hasLifeTableData: jest.fn((code: string) => {
      const validCountries = ['CHL', 'USA', 'MEX', 'ARG'];
      return validCountries.includes(code);
    }),
    NetworkError,
  };
});

// Mock the actuarial module
jest.mock('@/lib/models/actuarial', () => ({
  calculateExpectedEncounters: jest.fn(),
}));

// Mock the VisualizationChart component
jest.mock('../VisualizationChart', () => {
  return function MockVisualizationChart() {
    return <div data-testid="visualization-chart">Chart</div>;
  };
});

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string, params?: Record<string, unknown>) => {
    const translations: Record<string, string> = {
      'errors.loadingTitle': 'Error al cargar los datos',
      'errors.unknown': 'Error desconocido',
      'errors.retrySuggestions': 'Puedes intentar:',
      'errors.retryReload': 'Recargar la página',
      'errors.retryCountry': 'Seleccionar otro país de la lista',
      'errors.retryLater': 'Intentar de nuevo más tarde',
      'errors.noDataForCountry': `No disponemos de datos demográficos oficiales para ${params?.country || 'este país'}. Por favor selecciona otro país de la lista.`,
      'errors.noDataGeneric':
        'No disponemos de datos demográficos oficiales para este país. Por favor selecciona otro país de la lista.',
      'errors.ageExceedsYou':
        'Las tablas de vida solo incluyen datos hasta 100 años. Si tienes más de 100 años, lamentablemente no podemos calcular la estadística con precisión.',
      'errors.ageExceedsThem':
        'Las tablas de vida solo incluyen datos hasta 100 años para la persona que quieres ver. Los datos más allá de esa edad no están disponibles en nuestra fuente.',
      'errors.networkError':
        'Error de conexión. Verifica tu conexión a internet e intenta de nuevo.',
      'errors.calculationError': 'Error al calcular. Por favor verifica los datos ingresados.',
      'errors.calculating': 'Calculando...',
      'relationLabels.mother': 'tu madre',
      'relationLabels.father': 'tu padre',
      'relationLabels.grandmother_maternal': 'tu abuela materna',
      'relationLabels.grandmother_paternal': 'tu abuela paterna',
      'relationLabels.grandfather_maternal': 'tu abuelo materno',
      'relationLabels.grandfather_paternal': 'tu abuelo paterno',
      'relationLabels.partner': 'tu pareja',
      'relationLabels.friend': 'esta persona',
      'relationLabels.other_family': 'esta persona',
      'relationLabels.other': 'esta persona',
    };
    return translations[key] || key;
  },
  useLocale: () => 'es',
}));

// Import the mocked modules
import { getLifeTable, hasLifeTableData } from '@/lib/data';
import { calculateExpectedEncounters } from '@/lib/models/actuarial';

const mockLifeTable = {
  country: 'CHL',
  sex: 'female',
  year: 2023,
  entries: [
    { age: 0, qx: 0.00372, lx: 100000, ex: 83.08 },
    { age: 30, qx: 0.001, lx: 98000, ex: 53.5 },
    { age: 55, qx: 0.005, lx: 90000, ex: 30.2 },
  ],
};

const mockCalculationResult = {
  expectedVisits: 150,
  expectedVisitsRange: { p25: 120, p75: 180 },
  yearsWithBothAlive: { expected: 15, min: 10, max: 20 },
  yearByYearSurvival: [
    { year: 1, probability: 0.99, cumulativeVisits: 12 },
    { year: 2, probability: 0.98, cumulativeVisits: 24 },
  ],
  assumptions: {
    dataSource: 'UN WPP-2024',
    dataYear: 2024,
  },
};

const defaultInput: RelationshipInput = {
  you: {
    age: 30,
    sex: 'female',
    country: 'CHL',
  },
  them: {
    age: 55,
    sex: 'female',
    country: 'CHL',
  },
  relationType: 'mother',
  visitsPerYear: 12,
};

describe('Results component', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mocks
    (getLifeTable as jest.Mock).mockResolvedValue(mockLifeTable);
    (calculateExpectedEncounters as jest.Mock).mockReturnValue(mockCalculationResult);
    (hasLifeTableData as jest.Mock).mockImplementation((code: string) => {
      const validCountries = ['CHL', 'USA', 'MEX', 'ARG'];
      return validCountries.includes(code);
    });
  });

  describe('loading state', () => {
    it('should show loading state initially', () => {
      render(<Results input={defaultInput} />);

      expect(screen.getByText('Calculando...')).toBeInTheDocument();
    });
  });

  describe('successful calculation', () => {
    it('should display results after calculation', async () => {
      render(<Results input={defaultInput} />);

      await waitFor(() => {
        // "tu madre" appears multiple times in the results
        const elements = screen.getAllByText(/tu madre/);
        expect(elements.length).toBeGreaterThan(0);
      });
    });

    it('should display expected visits range', async () => {
      render(<Results input={defaultInput} />);

      await waitFor(() => {
        // Range values appear multiple times
        const elements120 = screen.getAllByText(/120/);
        const elements180 = screen.getAllByText(/180/);
        expect(elements120.length).toBeGreaterThan(0);
        expect(elements180.length).toBeGreaterThan(0);
      });
    });

    it('should render visualization chart', async () => {
      render(<Results input={defaultInput} />);

      await waitFor(() => {
        expect(screen.getByTestId('visualization-chart')).toBeInTheDocument();
      });
    });

    it('should display data source information', async () => {
      render(<Results input={defaultInput} />);

      await waitFor(() => {
        // Data source appears multiple times
        const elements = screen.getAllByText(/UN WPP-2024/);
        expect(elements.length).toBeGreaterThan(0);
      });
    });
  });

  describe('different relation types', () => {
    it('should display correct label for father', async () => {
      const input = { ...defaultInput, relationType: 'father' as const };
      render(<Results input={input} />);

      await waitFor(() => {
        // "tu padre" appears multiple times in the results
        const elements = screen.getAllByText(/tu padre/);
        expect(elements.length).toBeGreaterThan(0);
      });
    });

    it('should display correct label for partner', async () => {
      const input = { ...defaultInput, relationType: 'partner' as const };
      render(<Results input={input} />);

      await waitFor(() => {
        // "tu pareja" appears multiple times in the results
        const elements = screen.getAllByText(/tu pareja/);
        expect(elements.length).toBeGreaterThan(0);
      });
    });

    it('should display correct label for friend', async () => {
      const input = { ...defaultInput, relationType: 'friend' as const };
      render(<Results input={input} />);

      await waitFor(() => {
        // "esta persona" appears multiple times in the results
        const elements = screen.getAllByText(/esta persona/);
        expect(elements.length).toBeGreaterThan(0);
      });
    });
  });

  describe('direct mode', () => {
    it('should render different content in direct mode', async () => {
      render(<Results input={defaultInput} directMode={true} />);

      await waitFor(() => {
        expect(screen.getByText(/A este ritmo/)).toBeInTheDocument();
      });
    });
  });

  describe('error handling', () => {
    it('should show error when your country has no data', async () => {
      const invalidInput = {
        ...defaultInput,
        you: { ...defaultInput.you, country: 'XXX' },
      };

      render(<Results input={invalidInput} />);

      await waitFor(() => {
        expect(screen.getByText(/Error al cargar los datos/)).toBeInTheDocument();
      });
    });

    it('should show error when their country has no data', async () => {
      const invalidInput = {
        ...defaultInput,
        them: { ...defaultInput.them, country: 'ZZZ' },
      };

      render(<Results input={invalidInput} />);

      await waitFor(() => {
        expect(screen.getByText(/Error al cargar los datos/)).toBeInTheDocument();
      });
    });

    it('should show error when your age exceeds 100', async () => {
      const invalidInput = {
        ...defaultInput,
        you: { ...defaultInput.you, age: 105 },
      };

      render(<Results input={invalidInput} />);

      await waitFor(() => {
        expect(screen.getByText(/Error al cargar los datos/)).toBeInTheDocument();
        expect(screen.getByText(/100 años/)).toBeInTheDocument();
      });
    });

    it('should show error when their age exceeds 100', async () => {
      const invalidInput = {
        ...defaultInput,
        them: { ...defaultInput.them, age: 110 },
      };

      render(<Results input={invalidInput} />);

      await waitFor(() => {
        expect(screen.getByText(/Error al cargar los datos/)).toBeInTheDocument();
        expect(screen.getByText(/100 años/)).toBeInTheDocument();
      });
    });

    it('should show error when fetch fails', async () => {
      (getLifeTable as jest.Mock).mockRejectedValue(
        new Error('No disponemos de datos demográficos oficiales')
      );

      render(<Results input={defaultInput} />);

      await waitFor(() => {
        expect(screen.getByText(/Error al cargar los datos/)).toBeInTheDocument();
      });
    });

    it('should display retry suggestions on error', async () => {
      const invalidInput = {
        ...defaultInput,
        you: { ...defaultInput.you, country: 'XXX' },
      };

      render(<Results input={invalidInput} />);

      await waitFor(() => {
        expect(screen.getByText(/Recargar la página/)).toBeInTheDocument();
        expect(screen.getByText(/Seleccionar otro país/)).toBeInTheDocument();
      });
    });
  });

  describe('disclaimers and links', () => {
    it('should display methodology link', async () => {
      render(<Results input={defaultInput} />);

      await waitFor(() => {
        const links = screen.getAllByText(/Ver cómo funciona/);
        expect(links.length).toBeGreaterThan(0);
      });
    });

    it('should display UN data source link', async () => {
      render(<Results input={defaultInput} />);

      await waitFor(() => {
        const sourceLink = screen.getByText(/Ver fuente oficial/);
        expect(sourceLink).toBeInTheDocument();
      });
    });

    it('should display disclaimers about what the tool does not do', async () => {
      render(<Results input={defaultInput} />);

      await waitFor(() => {
        expect(screen.getByText(/No predice cuándo morirá nadie/)).toBeInTheDocument();
        expect(screen.getByText(/No debe usarse para decisiones médicas/)).toBeInTheDocument();
      });
    });
  });

  describe('API calls', () => {
    it('should call getLifeTable for both users', async () => {
      render(<Results input={defaultInput} />);

      await waitFor(() => {
        expect(getLifeTable).toHaveBeenCalledWith('CHL', 'female');
        expect(getLifeTable).toHaveBeenCalledTimes(2);
      });
    });

    it('should call calculateExpectedEncounters with correct params', async () => {
      render(<Results input={defaultInput} />);

      await waitFor(() => {
        expect(calculateExpectedEncounters).toHaveBeenCalledWith(
          defaultInput,
          mockLifeTable,
          mockLifeTable
        );
      });
    });

    it('should call hasLifeTableData for validation', async () => {
      render(<Results input={defaultInput} />);

      await waitFor(() => {
        expect(hasLifeTableData).toHaveBeenCalledWith('CHL');
      });
    });
  });
});
