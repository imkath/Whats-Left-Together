'use client';

import { useState, type ReactNode } from 'react';

const CURRENT_YEAR = new Date().getFullYear();

interface AgeFieldProps {
  id: string;
  ageLabel: string;
  yearLabel: string;
  useBirthYearLabel: string;
  useAgeLabel: string;
  yearPlaceholder: string;
  age: number;
  onAge: (age: number) => void;
  invalid?: boolean;
  error?: ReactNode;
}

/**
 * Age input with a "birth year" alternative: many people remember a loved
 * one's birth year more easily than their current age. The model only needs
 * the age, so the year is converted (capped at the life-table limit of 100).
 */
export default function AgeField({
  id,
  ageLabel,
  yearLabel,
  useBirthYearLabel,
  useAgeLabel,
  yearPlaceholder,
  age,
  onAge,
  invalid,
  error,
}: AgeFieldProps) {
  const [byYear, setByYear] = useState(false);
  const [yearStr, setYearStr] = useState('');

  const ageFromYear = (s: string) => {
    const y = parseInt(s, 10);
    if (Number.isNaN(y)) return 0;
    return Math.min(100, Math.max(0, CURRENT_YEAR - y));
  };

  const toggle = () => {
    if (!byYear) setYearStr(age ? String(CURRENT_YEAR - age) : '');
    setByYear((v) => !v);
  };

  const errClass = invalid ? 'border-neutral-800 dark:border-neutral-200' : '';

  return (
    <div>
      <label htmlFor={id} className="block text-xs text-neutral-500 dark:text-neutral-400 mb-1.5">
        {byYear ? yearLabel : ageLabel}
      </label>
      {byYear ? (
        <input
          id={id}
          type="number"
          inputMode="numeric"
          min={CURRENT_YEAR - 100}
          max={CURRENT_YEAR}
          value={yearStr}
          onChange={(e) => {
            setYearStr(e.target.value);
            onAge(ageFromYear(e.target.value));
          }}
          className={`input-field ${errClass}`}
          placeholder={yearPlaceholder}
          aria-invalid={invalid}
        />
      ) : (
        <input
          id={id}
          type="number"
          inputMode="numeric"
          min="0"
          max="100"
          value={age === 0 ? '' : age}
          onChange={(e) => onAge(e.target.value === '' ? 0 : parseInt(e.target.value))}
          className={`input-field ${errClass}`}
          aria-invalid={invalid}
        />
      )}
      {error}
      <button
        type="button"
        onClick={toggle}
        className="mt-1.5 text-xs text-neutral-500 dark:text-neutral-400 underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-presence rounded-sm"
      >
        {byYear ? useAgeLabel : useBirthYearLabel}
      </button>
    </div>
  );
}
