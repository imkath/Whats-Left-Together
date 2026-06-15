/**
 * Tests for the Calculator wizard
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import Calculator from '../Calculator';

// Mock next-intl. The mock ignores the namespace and falls back to the key,
// which is enough for the wizard keys (next/back/presetMonthly/...).
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      title: 'Calculator',
      subtitle: 'Calculate how many times you will see someone',
      female: 'Female',
      male: 'Male',
      relationship: 'Relationship',
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
    };
    return translations[key] || key;
  },
  useLocale: () => 'es',
}));

// Mock Results to avoid loading life tables in tests
jest.mock('../Results', () => {
  return function MockResults() {
    return <div data-testid="results">Results shown</div>;
  };
});

const next = (user: ReturnType<typeof userEvent.setup>) =>
  user.click(screen.getByRole('button', { name: 'next' }));

describe('Calculator wizard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('step 1 — the person', () => {
    it('renders the relationship and optional name fields', () => {
      render(<Calculator />);
      expect(screen.getByText('Calculator')).toBeInTheDocument();
      expect(screen.getByLabelText('Relationship')).toBeInTheDocument();
      expect(document.getElementById('them-name')).toBeInTheDocument();
    });

    it('defaults the relationship to grandmother_maternal', () => {
      render(<Calculator />);
      expect(screen.getByLabelText('Relationship')).toHaveValue('grandmother_maternal');
    });

    it('updates the relationship', async () => {
      render(<Calculator />);
      const user = userEvent.setup();
      await user.selectOptions(screen.getByLabelText('Relationship'), 'father');
      expect(screen.getByLabelText('Relationship')).toHaveValue('father');
    });

    it('captures an optional name', async () => {
      render(<Calculator />);
      const user = userEvent.setup();
      const name = document.getElementById('them-name') as HTMLInputElement;
      await user.type(name, 'María');
      expect(name.value).toBe('María');
    });
  });

  describe('step 2 — about them', () => {
    it('shows their age (default 75) and a sex toggle defaulting to female', async () => {
      render(<Calculator />);
      const user = userEvent.setup();
      await next(user);
      const theirAge = document.getElementById('their-age') as HTMLInputElement;
      expect(theirAge.value).toBe('75');
      expect(screen.getByRole('radio', { name: 'Female' })).toHaveAttribute('aria-checked', 'true');
    });

    it('switches sex through the toggle', async () => {
      render(<Calculator />);
      const user = userEvent.setup();
      await next(user);
      const male = screen.getByRole('radio', { name: 'Male' });
      await user.click(male);
      expect(male).toHaveAttribute('aria-checked', 'true');
    });

    it('blocks advancing when their age is cleared', async () => {
      render(<Calculator />);
      const user = userEvent.setup();
      await next(user);
      const theirAge = document.getElementById('their-age') as HTMLInputElement;
      await user.clear(theirAge);
      await next(user);
      // Still on step 2
      expect(document.getElementById('their-age')).toBeInTheDocument();
    });
  });

  describe('step 3 — about you', () => {
    it('shows your age (default 30)', async () => {
      render(<Calculator />);
      const user = userEvent.setup();
      await next(user);
      await next(user);
      const yourAge = document.getElementById('your-age') as HTMLInputElement;
      expect(yourAge.value).toBe('30');
    });
  });

  describe('step 4 — frequency', () => {
    it('shows presets with the monthly preset active by default', async () => {
      render(<Calculator />);
      const user = userEvent.setup();
      await next(user);
      await next(user);
      await next(user);
      expect(screen.getByRole('button', { name: 'presetMonthly' })).toHaveAttribute(
        'aria-pressed',
        'true'
      );
    });

    it('changes the active preset', async () => {
      render(<Calculator />);
      const user = userEvent.setup();
      await next(user);
      await next(user);
      await next(user);
      const weekly = screen.getByRole('button', { name: 'presetWeekly' });
      await user.click(weekly);
      expect(weekly).toHaveAttribute('aria-pressed', 'true');
    });
  });

  describe('navigation & submission', () => {
    it('lets you go back a step', async () => {
      render(<Calculator />);
      const user = userEvent.setup();
      await next(user);
      await user.click(screen.getByRole('button', { name: 'back' }));
      expect(screen.getByLabelText('Relationship')).toBeInTheDocument();
    });

    it('shows results after calculating with defaults', async () => {
      render(<Calculator />);
      const user = userEvent.setup();
      await next(user);
      await next(user);
      await next(user);
      await user.click(screen.getByRole('button', { name: 'Calculate' }));
      await waitFor(() => {
        expect(screen.getByTestId('results')).toBeInTheDocument();
      });
    });
  });
});
