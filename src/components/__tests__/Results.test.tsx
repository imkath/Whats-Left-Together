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
      // Error translations
      'errors.loadingTitle': 'Error al cargar los datos',
      'errors.unknown': 'Error desconocido',
      'errors.retrySuggestions': 'Puedes intentar:',
      'errors.retryReload': 'Recargar la página',
      'errors.retryCountry': 'Seleccionar otro país de la lista',
      'errors.retryLater': 'Intentar de nuevo más tarde',
      'errors.retry': 'Reintentar',
      'errors.noDataForCountry': `No disponemos de datos demográficos oficiales para ${params?.country || 'este país'}. Por favor selecciona otro país de la lista.`,
      'errors.ageExceedsYou':
        'Las tablas de vida solo incluyen datos hasta 100 años. Si tienes más de 100 años, lamentablemente no podemos calcular la estadística con precisión.',
      'errors.ageExceedsThem':
        'Las tablas de vida solo incluyen datos hasta 100 años para la persona que quieres ver. Los datos más allá de esa edad no están disponibles en nuestra fuente.',
      'errors.networkError':
        'Error de conexión. Verifica tu conexión a internet e intenta de nuevo.',
      'errors.calculationError': 'Error al calcular. Por favor verifica los datos ingresados.',
      'errors.calculating': 'Calculando...',
      // Relation labels
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
      // Visualization
      'visualization.title': 'Tus encuentros restantes',
      'visualization.yAxisLabel': 'Encuentros',
      'visualization.overlayLine1': 'Te quedan aproximadamente',
      'visualization.overlayCount': `${params?.count || 0} encuentros`,
      'visualization.overlayLine2': 'con esta persona.',
      // Stats
      'stats.rangeTitle': 'Rango estimado',
      'stats.rangeSubtitle': 'encuentros estimados restantes (percentil 25-75)',
      'stats.survivalTitle': 'Probabilidad a 5 años',
      'stats.survivalSubtitle': 'de que ambos estén vivos en 5 años',
      // Normal mode
      'normalMode.para1': `Según los datos demográficos de ${params?.country || 'este país'}, es probable que ambos coincidan vivos entre ${params?.yearsMin || 0} y ${params?.yearsMax || 0} años más.`,
      'normalMode.para2': `Si sigues viendo a ${params?.relation || 'esta persona'} ${params?.frequency || 0} veces al año, podrías compartir entre ${params?.min || 0} y ${params?.max || 0} encuentros más.`,
      'normalMode.para3_main': 'Esto no es una predicción. Es una invitación a reflexionar.',
      'normalMode.para3_emphasis': 'Cada encuentro importa.',
      // Actions
      'actions.title': '¿Qué puedes hacer?',
      'actions.plan.title': 'Planifica una visita',
      'actions.plan.description': 'No esperes al momento perfecto.',
      'actions.share.title': 'Comparte un recuerdo',
      'actions.share.description': 'Envía un mensaje a esa persona.',
      'actions.write.title': 'Escribe una carta',
      'actions.write.description': 'Pon en palabras lo que sientes.',
      // Chart
      'chart.intro': 'Probabilidad de supervivencia año a año.',
      'chart.description': `Basado en ${params?.source || 'datos demográficos'}.`,
      'chart.noData': 'No hay datos disponibles.',
      'chart.bothAlive': 'Ambos vivos',
      'chart.youAlive': 'Tú vivo/a',
      'chart.themAlive': 'Ellos vivo/a',
      'chart.futureYears': 'Años en el futuro',
      'chart.now': 'Ahora',
      // Assumptions
      'assumptions.title': 'Supuestos y limitaciones',
      'assumptions.whatLabel': '¿Qué es esto?',
      'assumptions.what': 'Una reflexión estadística, no una predicción.',
      'assumptions.whatNot': 'Esto NO es:',
      'assumptions.point1': 'No predice cuándo morirá nadie.',
      'assumptions.point2': 'No debe usarse para decisiones médicas.',
      'assumptions.point3': 'No considera condiciones individuales de salud.',
      'assumptions.point4': 'No tiene en cuenta eventos imprevistos.',
      'assumptions.dataFreshness': 'Datos actualizados con las últimas tablas de vida disponibles.',
      seeMethodology: 'Ver cómo funciona',
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
  expectedVisitsRange: { p25: 120, p50: 150, p75: 180 },
  yearsWithBothAlive: { expected: 15, min: 10, max: 20 },
  yearByYearSurvival: [
    { year: 0, youAlive: 1.0, themAlive: 1.0, bothAlive: 1.0 },
    { year: 1, youAlive: 0.99, themAlive: 0.98, bothAlive: 0.97 },
    { year: 2, youAlive: 0.98, themAlive: 0.96, bothAlive: 0.94 },
    { year: 5, youAlive: 0.95, themAlive: 0.9, bothAlive: 0.86 },
    { year: 10, youAlive: 0.9, themAlive: 0.8, bothAlive: 0.72 },
  ],
  assumptions: {
    youLifeExpectancy: 53.5,
    themLifeExpectancy: 30.2,
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

    it('should display data source information', async () => {
      render(<Results input={defaultInput} />);

      await waitFor(() => {
        const elements = screen.getAllByText(/UN WPP-2024/);
        expect(elements.length).toBeGreaterThan(0);
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
