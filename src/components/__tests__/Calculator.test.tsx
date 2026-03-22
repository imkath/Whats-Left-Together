/**
 * Tests for Calculator component
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import Calculator from '../Calculator';

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string, params?: Record<string, unknown>) => {
    const translations: Record<string, string> = {
      title: 'Calculator',
      subtitle: 'Calculate how many times you will see someone',
      yourInfo: 'Your Information',
      theirInfo: 'Their Information',
      age: 'Age',
      sex: 'Sex',
      country: 'Country',
      female: 'Female',
      male: 'Male',
      relationship: 'Relationship',
      frequency: 'Frequency',
      frequencyPeriodLabel: 'How often do you see them?',
      timesPerPeriodLabel: 'How many times?',
      timesPerPeriodNote: `Maximum ${params?.max || 31} times per ${params?.period || 'month'}`,
      frequencySummary: 'Summary',
      visitsPerYear: 'visits per year',
      directMode: 'Direct mode',
      directModeHelp: 'Show result more directly',
      calculate: 'Calculate',
      'relations.mother': 'Mother',
      'relations.father': 'Father',
      'relations.grandmother_maternal': 'Maternal Grandmother',
      'relations.grandmother_paternal': 'Paternal Grandmother',
      'relations.grandfather_maternal': 'Maternal Grandfather',
      'relations.grandfather_paternal': 'Paternal Grandfather',
      'relations.partner': 'Partner',
      'relations.friend': 'Friend',
      'relations.other_family': 'Other Family',
      'relations.other': 'Other',
      'frequencyPeriods.weekly': 'Weekly',
      'frequencyPeriods.monthly': 'Monthly',
      'frequencyPeriods.quarterly': 'Quarterly',
      'frequencyPeriods.yearly': 'Yearly',
      'frequencyTimes.weekly': 'times per week',
      'frequencyTimes.monthly': 'times per month',
      'frequencyTimes.quarterly': 'times per quarter',
      'frequencyTimes.yearly': 'times per year',
    };
    return translations[key] || key;
  },
  useLocale: () => 'es',
}));

// Mock the Results component to avoid loading life tables in tests
jest.mock('../Results', () => {
  return function MockResults() {
    return <div data-testid="results">Results shown</div>;
  };
});

describe('Calculator component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render the calculator form', () => {
      render(<Calculator />);

      expect(screen.getByText('Calculator')).toBeInTheDocument();
      expect(screen.getByText('Your Information')).toBeInTheDocument();
      expect(screen.getByText('Their Information')).toBeInTheDocument();
      expect(screen.getByText('Frequency')).toBeInTheDocument();
    });

    it('should render all form fields with proper label associations', () => {
      render(<Calculator />);

      // Age inputs (use getElementById since there are multiple "Age" labels)
      expect(document.getElementById('your-age')).toBeInTheDocument();
      expect(document.getElementById('their-age')).toBeInTheDocument();

      // Sex selects (use getElementById since labels contain extra tooltip elements)
      expect(document.getElementById('your-sex')).toBeInTheDocument();
      expect(document.getElementById('their-sex')).toBeInTheDocument();

      // Country selects
      expect(document.getElementById('your-country')).toBeInTheDocument();
      expect(document.getElementById('their-country')).toBeInTheDocument();

      // Relationship select
      expect(screen.getByLabelText('Relationship')).toBeInTheDocument();

      // Times per period
      expect(screen.getByLabelText('How many times?')).toBeInTheDocument();
    });

    it('should render frequency period buttons', () => {
      render(<Calculator />);

      expect(screen.getByRole('button', { name: 'Weekly' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Monthly' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Quarterly' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Yearly' })).toBeInTheDocument();
    });

    it('should render the calculate button', () => {
      render(<Calculator />);

      expect(screen.getByRole('button', { name: 'Calculate' })).toBeInTheDocument();
    });
  });

  describe('form interactions', () => {
    it('should update your age when changed', async () => {
      render(<Calculator />);
      const user = userEvent.setup();

      const yourAgeInput = screen.getByLabelText('Age', {
        selector: '#your-age',
      }) as HTMLInputElement;

      await user.clear(yourAgeInput);
      await user.type(yourAgeInput, '25');

      expect(yourAgeInput.value).toBe('25');
    });

    it('should update their age when changed', async () => {
      render(<Calculator />);
      const user = userEvent.setup();

      const theirAgeInput = document.getElementById('their-age') as HTMLInputElement;

      await user.clear(theirAgeInput);
      await user.type(theirAgeInput, '60');

      expect(theirAgeInput.value).toBe('60');
    });

    it('should update sex selection', async () => {
      render(<Calculator />);
      const user = userEvent.setup();

      const yourSexSelect = document.getElementById('your-sex') as HTMLSelectElement;

      await user.selectOptions(yourSexSelect, 'male');

      expect(yourSexSelect).toHaveValue('male');
    });

    it('should update relationship selection', async () => {
      render(<Calculator />);
      const user = userEvent.setup();

      const relationshipSelect = screen.getByLabelText('Relationship');

      await user.selectOptions(relationshipSelect, 'father');

      expect(relationshipSelect).toHaveValue('father');
    });

    it('should change frequency period when button is clicked', async () => {
      render(<Calculator />);
      const user = userEvent.setup();

      const weeklyButton = screen.getByRole('button', { name: 'Weekly' });

      await user.click(weeklyButton);

      // The active button should be pressed
      expect(weeklyButton).toHaveAttribute('aria-pressed', 'true');
    });

    it('should update times per period input', async () => {
      render(<Calculator />);
      const user = userEvent.setup();

      const timesInput = screen.getByLabelText('How many times?') as HTMLInputElement;

      // Clear and type new value
      await user.tripleClick(timesInput);
      await user.keyboard('3');

      expect(timesInput.value).toBe('3');
    });
  });

  describe('form submission', () => {
    it('should show results when form is submitted with valid data', async () => {
      render(<Calculator />);
      const user = userEvent.setup();

      // Submit the form with default values
      const submitButton = screen.getByRole('button', { name: 'Calculate' });
      await user.click(submitButton);

      // Results should be shown
      await waitFor(() => {
        expect(screen.getByTestId('results')).toBeInTheDocument();
      });
    });
  });

  describe('frequency calculations', () => {
    it('should calculate visits per year correctly for monthly frequency', () => {
      render(<Calculator />);

      // Monthly is default, 1 time per month = 12 visits per year
      expect(screen.getByText(/12/)).toBeInTheDocument();
    });

    it('should calculate visits per year correctly for weekly frequency', async () => {
      render(<Calculator />);
      const user = userEvent.setup();

      // Click weekly
      const weeklyButton = screen.getByRole('button', { name: 'Weekly' });
      await user.click(weeklyButton);

      // 1 time per week = 52 visits per year
      await waitFor(() => {
        expect(screen.getByText(/52/)).toBeInTheDocument();
      });
    });

    it('should calculate visits per year correctly for quarterly frequency', async () => {
      render(<Calculator />);
      const user = userEvent.setup();

      // Click quarterly
      const quarterlyButton = screen.getByRole('button', { name: 'Quarterly' });
      await user.click(quarterlyButton);

      // 1 time per quarter = 4 visits per year
      await waitFor(() => {
        expect(screen.getByText('4')).toBeInTheDocument();
      });
    });

    it('should update visits when times per period changes', async () => {
      render(<Calculator />);
      const user = userEvent.setup();

      const timesInput = screen.getByLabelText('How many times?') as HTMLInputElement;

      // Change to 2 times per month = 24 visits per year
      await user.tripleClick(timesInput);
      await user.keyboard('2');

      await waitFor(() => {
        expect(screen.getByText(/24/)).toBeInTheDocument();
      });
    });
  });

  describe('default values', () => {
    it('should have correct default ages', () => {
      render(<Calculator />);

      const yourAgeInput = document.getElementById('your-age') as HTMLInputElement;
      const theirAgeInput = document.getElementById('their-age') as HTMLInputElement;

      expect(yourAgeInput.value).toBe('30');
      expect(theirAgeInput.value).toBe('75');
    });

    it('should have female as default sex', () => {
      render(<Calculator />);

      const yourSexSelect = document.getElementById('your-sex') as HTMLSelectElement;
      const theirSexSelect = document.getElementById('their-sex') as HTMLSelectElement;

      expect(yourSexSelect).toHaveValue('female');
      expect(theirSexSelect).toHaveValue('female');
    });

    it('should have grandmother_maternal as default relationship', () => {
      render(<Calculator />);

      const relationshipSelect = screen.getByLabelText('Relationship');

      expect(relationshipSelect).toHaveValue('grandmother_maternal');
    });

    it('should have monthly as default frequency period', () => {
      render(<Calculator />);

      const monthlyButton = screen.getByRole('button', { name: 'Monthly' });

      expect(monthlyButton).toHaveAttribute('aria-pressed', 'true');
    });

    it('should have Chile as default country', () => {
      render(<Calculator />);

      const yourCountrySelect = document.getElementById('your-country') as HTMLSelectElement;
      const theirCountrySelect = document.getElementById('their-country') as HTMLSelectElement;

      expect(yourCountrySelect).toHaveValue('CHL');
      expect(theirCountrySelect).toHaveValue('CHL');
    });
  });
});
