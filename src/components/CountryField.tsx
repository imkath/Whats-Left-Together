'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { CheckCircle } from '@solar-icons/react';
import type { Country } from '@/lib/data';

interface CountryFieldProps {
  label: string;
  value: string; // ISO country code
  onChange: (code: string) => void;
  countries: Country[];
  locale: 'es' | 'en';
  placeholder?: string;
}

const MAX_OPTIONS = 8;

// "Perú", "peru" and "PERU" should all find the same country.
const fold = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

/**
 * Country search following the ARIA combobox pattern. A country only counts
 * once it is picked from the list, and the field always says which one is in
 * use, so typed text is never silently taken or silently dropped.
 */
export default function CountryField({
  label,
  value,
  onChange,
  countries,
  locale,
  placeholder,
}: CountryFieldProps) {
  const t = useTranslations('calculator.country');
  const inputId = useId();
  const listId = useId();
  const statusId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const nameOf = (c: Country) => (locale === 'es' ? c.nameEs : c.name);

  const selected = countries.find((c) => c.code === value);
  const [query, setQuery] = useState(selected ? nameOf(selected) : '');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [rejected, setRejected] = useState<string | null>(null);

  useEffect(() => {
    const current = countries.find((c) => c.code === value);
    setQuery(current ? nameOf(current) : '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, locale]);

  const matches = useMemo(() => {
    const q = fold(query);
    if (!q || (selected && q === fold(nameOf(selected)))) return countries.slice(0, MAX_OPTIONS);
    const starts: Country[] = [];
    const contains: Country[] = [];
    for (const c of countries) {
      const names = [fold(c.nameEs), fold(c.name)];
      if (names.some((n) => n.startsWith(q))) starts.push(c);
      else if (names.some((n) => n.includes(q))) contains.push(c);
    }
    return [...starts, ...contains].slice(0, MAX_OPTIONS);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, countries, locale, selected]);

  const choose = (c: Country) => {
    onChange(c.code);
    setQuery(nameOf(c));
    setRejected(null);
    setOpen(false);
  };

  // Leaving the field: an exact name still counts; anything else is reported
  // and the previous country stays.
  const settle = () => {
    setOpen(false);
    const typed = fold(query);
    if (selected && typed === fold(nameOf(selected))) return;
    const exact = countries.find((c) => fold(c.nameEs) === typed || fold(c.name) === typed);
    if (exact) return choose(exact);
    setRejected(query.trim() || null);
    setQuery(selected ? nameOf(selected) : '');
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setActive((i) => Math.min(i + 1, matches.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && open) {
      // Pick the highlighted country instead of submitting the step.
      e.preventDefault();
      if (matches[active]) choose(matches[active]);
    } else if (e.key === 'Escape' && open) {
      e.preventDefault();
      setOpen(false);
      setQuery(selected ? nameOf(selected) : '');
    }
  };

  const confirmed = !open && selected && fold(query) === fold(nameOf(selected));

  return (
    <div>
      <label htmlFor={inputId} className="field-label">
        {label}
      </label>
      <div className="relative">
        <input
          ref={inputRef}
          id={inputId}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={open && matches[active] ? `${listId}-${active}` : undefined}
          aria-describedby={statusId}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setRejected(null);
            setActive(0);
            setOpen(true);
          }}
          onFocus={(e) => e.target.select()}
          onClick={() => setOpen(true)}
          onBlur={settle}
          onKeyDown={onKeyDown}
          className="input-field pr-10"
          placeholder={placeholder}
          autoComplete="off"
          spellCheck={false}
        />
        {confirmed && (
          <CheckCircle
            size={20}
            aria-hidden="true"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-900 dark:text-neutral-100"
          />
        )}

        {open && (
          <ul
            id={listId}
            role="listbox"
            aria-label={label}
            className="absolute z-20 mt-1 w-full max-h-72 overflow-auto py-1 rounded-md border border-neutral-300 bg-neutral-50 dark:bg-neutral-900 dark:border-neutral-600"
          >
            {matches.length === 0 ? (
              <li className="px-4 py-3 text-sm text-neutral-500 dark:text-neutral-400">
                {t('noMatch', { query: query.trim() })}
              </li>
            ) : (
              matches.map((c, i) => (
                <li
                  key={c.code}
                  id={`${listId}-${i}`}
                  role="option"
                  aria-selected={c.code === value}
                  // mousedown fires before the input's blur, so the pick isn't lost.
                  onMouseDown={(e) => {
                    e.preventDefault();
                    choose(c);
                  }}
                  onMouseEnter={() => setActive(i)}
                  className={`flex items-center justify-between gap-3 px-4 py-2.5 text-sm cursor-pointer ${
                    i === active ? 'bg-neutral-100 dark:bg-neutral-800' : ''
                  }`}
                >
                  <span className="text-neutral-900 dark:text-neutral-100">{nameOf(c)}</span>
                  {c.code === value && (
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">
                      {t('current')}
                    </span>
                  )}
                </li>
              ))
            )}
          </ul>
        )}
      </div>

      <p id={statusId} aria-live="polite" className="mt-2 text-sm min-h-[1.25rem]">
        {rejected ? (
          <span className="text-neutral-900 dark:text-neutral-100">
            {t('rejected', {
              query: rejected,
              country: selected ? nameOf(selected) : '',
            })}
          </span>
        ) : confirmed ? (
          <span className="text-neutral-500 dark:text-neutral-400">
            {t('using', { country: nameOf(selected) })}
          </span>
        ) : null}
      </p>
    </div>
  );
}
