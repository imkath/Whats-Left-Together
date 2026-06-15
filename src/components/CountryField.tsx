'use client';

import { useEffect, useId, useState } from 'react';
import type { Country } from '@/lib/data';

interface CountryFieldProps {
  label: string;
  value: string; // ISO country code
  onChange: (code: string) => void;
  countries: Country[];
  locale: 'es' | 'en';
  placeholder?: string;
}

/**
 * Searchable country picker. Uses a native <datalist> for typeahead so the
 * 197-item list never forces an endless scroll (type "chi" -> Chile), while
 * staying accessible and dependency-free.
 */
export default function CountryField({
  label,
  value,
  onChange,
  countries,
  locale,
  placeholder,
}: CountryFieldProps) {
  const inputId = useId();
  const listId = useId();
  const nameOf = (c: Country) => (locale === 'es' ? c.nameEs : c.name);

  const selected = countries.find((c) => c.code === value);
  const [query, setQuery] = useState(selected ? nameOf(selected) : '');

  // Keep the input text in sync when the code or locale changes externally.
  useEffect(() => {
    const current = countries.find((c) => c.code === value);
    setQuery(current ? nameOf(current) : '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, locale]);

  const findByName = (text: string) =>
    countries.find((c) => nameOf(c).toLowerCase() === text.trim().toLowerCase());

  return (
    <div>
      <label
        htmlFor={inputId}
        className="block text-xs text-neutral-500 dark:text-neutral-400 mb-1.5"
      >
        {label}
      </label>
      <input
        id={inputId}
        list={listId}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          const match = findByName(e.target.value);
          if (match) onChange(match.code);
        }}
        onBlur={(e) => {
          // If the text doesn't resolve to a country, revert to the current selection.
          if (!findByName(e.target.value)) {
            const current = countries.find((c) => c.code === value);
            setQuery(current ? nameOf(current) : '');
          }
        }}
        className="input-field"
        placeholder={placeholder}
        autoComplete="off"
        spellCheck={false}
        aria-label={label}
      />
      <datalist id={listId}>
        {countries.map((c) => (
          <option key={c.code} value={nameOf(c)} />
        ))}
      </datalist>
    </div>
  );
}
