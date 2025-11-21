'use client';

import { useState, useRef } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Info } from 'lucide-react';
import type { RelationshipInput, Sex, RelationType, FrequencyPeriod } from '@/types';
import Results from './Results';
import ErrorBoundary from './ErrorBoundary';
import { getAvailableCountries } from '@/lib/data';
import { getMaxTimesForPeriod, calculateVisitsPerYear } from '@/lib/utils/frequency';
import { relationshipInputSchema } from '@/lib/validation/schemas';
import type { ZodError } from 'zod';

export default function Calculator() {
  const t = useTranslations('calculator');
  const locale = useLocale();
  const countries = getAvailableCountries();
  const resultsRef = useRef<HTMLDivElement>(null);
  const resultsHeadingRef = useRef<HTMLHeadingElement>(null);

  const [formData, setFormData] = useState<RelationshipInput>({
    you: {
      age: 30,
      sex: 'female' as Sex,
      country: 'CHL',
    },
    them: {
      age: 75,
      sex: 'female' as Sex,
      country: 'CHL',
    },
    relationType: 'grandmother_maternal' as RelationType,
    visitsPerYear: 12,
    frequencyPeriod: 'monthly' as FrequencyPeriod,
    timesPerPeriod: 1,
  });

  const [showResults, setShowResults] = useState(false);
  const [directMode, setDirectMode] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});

    // Validate with Zod
    const result = relationshipInputSchema.safeParse(formData);

    if (!result.success) {
      // Convert Zod errors to a more usable format
      const errors: Record<string, string> = {};
      (result.error as ZodError).errors.forEach((error) => {
        const path = error.path.join('.');
        errors[path] = error.message;
      });
      setValidationErrors(errors);
      return;
    }

    setShowResults(true);

    // Scroll to results and focus for accessibility
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Focus on results heading for screen readers
      resultsHeadingRef.current?.focus();
    }, 100);
  };

  const updateFormData = (section: 'you' | 'them', field: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const updateFrequencyPeriod = (period: FrequencyPeriod) => {
    const times = formData.timesPerPeriod || 1;
    setFormData((prev) => ({
      ...prev,
      frequencyPeriod: period,
      timesPerPeriod: times,
      visitsPerYear: calculateVisitsPerYear(period, times),
    }));
  };

  const updateTimesPerPeriod = (times: number | null) => {
    const period = formData.frequencyPeriod || 'monthly';

    if (times === null || times === 0) {
      // Allow empty/zero temporarily for user to type a new number
      setFormData((prev) => ({
        ...prev,
        timesPerPeriod: 0, // Keep as 0 to allow user to type
        visitsPerYear: 0,
      }));
      return;
    }

    const maxTimes = getMaxTimesForPeriod(period);
    const validTimes = Math.min(Math.max(1, times), maxTimes);

    setFormData((prev) => ({
      ...prev,
      timesPerPeriod: validTimes,
      visitsPerYear: calculateVisitsPerYear(period, validTimes),
    }));
  };

  return (
    <div id="calculator" className="space-y-8">
      <div className="text-center mb-8">
        <h2>{t('title')}</h2>
        <p className="text-neutral-600 dark:text-neutral-400 mt-2">{t('subtitle')}</p>
      </div>

      <form onSubmit={handleSubmit} className="card max-w-3xl mx-auto">
        {/* Your information */}
        <div className="mb-8">
          <h3 className="text-xl mb-4 pb-2 border-b border-neutral-200 dark:border-neutral-700">
            {t('yourInfo')}
          </h3>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="your-age"
                className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2"
              >
                {t('age')}
              </label>
              <input
                id="your-age"
                type="number"
                min="0"
                max="100"
                value={formData.you.age === 0 ? '' : formData.you.age}
                onChange={(e) => {
                  const value = e.target.value === '' ? 0 : parseInt(e.target.value);
                  updateFormData('you', 'age', value);
                }}
                className="input-field"
                required
              />
            </div>

            <div>
              <label
                htmlFor="your-sex"
                className="flex items-center gap-1 text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2"
              >
                {t('sex')}
                <span className="relative group">
                  <Info
                    size={14}
                    strokeWidth={2.5}
                    className="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 cursor-help"
                  />
                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 text-xs bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-800 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity w-64 text-center pointer-events-none z-10 whitespace-normal">
                    {t('sexTooltip')}
                  </span>
                </span>
              </label>
              <select
                id="your-sex"
                value={formData.you.sex}
                onChange={(e) => updateFormData('you', 'sex', e.target.value)}
                className="input-field"
                required
              >
                <option value="female">{t('female')}</option>
                <option value="male">{t('male')}</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="your-country"
                className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2"
              >
                {t('country')}
              </label>
              <select
                id="your-country"
                value={formData.you.country}
                onChange={(e) => updateFormData('you', 'country', e.target.value)}
                className="input-field"
                required
              >
                {countries.map((country) => (
                  <option key={country.code} value={country.code}>
                    {locale === 'es' ? country.nameEs : country.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Their information */}
        <div className="mb-8">
          <h3 className="text-xl mb-4 pb-2 border-b border-neutral-200 dark:border-neutral-700">
            {t('theirInfo')}
          </h3>

          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <label
                htmlFor="relationship"
                className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2"
              >
                {t('relationship')}
              </label>
              <select
                id="relationship"
                value={formData.relationType}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, relationType: e.target.value as RelationType }))
                }
                className="input-field"
                required
              >
                <option value="mother">{t('relations.mother')}</option>
                <option value="father">{t('relations.father')}</option>
                <option value="grandmother_maternal">{t('relations.grandmother_maternal')}</option>
                <option value="grandmother_paternal">{t('relations.grandmother_paternal')}</option>
                <option value="grandfather_maternal">{t('relations.grandfather_maternal')}</option>
                <option value="grandfather_paternal">{t('relations.grandfather_paternal')}</option>
                <option value="partner">{t('relations.partner')}</option>
                <option value="friend">{t('relations.friend')}</option>
                <option value="other_family">{t('relations.other_family')}</option>
                <option value="other">{t('relations.other')}</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="their-age"
                className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2"
              >
                {t('age')}
              </label>
              <input
                id="their-age"
                type="number"
                min="0"
                max="100"
                value={formData.them.age === 0 ? '' : formData.them.age}
                onChange={(e) => {
                  const value = e.target.value === '' ? 0 : parseInt(e.target.value);
                  updateFormData('them', 'age', value);
                }}
                className="input-field"
                required
              />
            </div>

            <div>
              <label
                htmlFor="their-sex"
                className="flex items-center gap-1 text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2"
              >
                {t('sex')}
                <span className="relative group">
                  <Info
                    size={14}
                    strokeWidth={2.5}
                    className="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 cursor-help"
                  />
                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 text-xs bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-800 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity w-64 text-center pointer-events-none z-10 whitespace-normal">
                    {t('sexTooltip')}
                  </span>
                </span>
              </label>
              <select
                id="their-sex"
                value={formData.them.sex}
                onChange={(e) => updateFormData('them', 'sex', e.target.value)}
                className="input-field"
                required
              >
                <option value="female">{t('female')}</option>
                <option value="male">{t('male')}</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="their-country"
                className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2"
              >
                {t('country')}
              </label>
              <select
                id="their-country"
                value={formData.them.country}
                onChange={(e) => updateFormData('them', 'country', e.target.value)}
                className="input-field"
                required
              >
                {countries.map((country) => (
                  <option key={country.code} value={country.code}>
                    {locale === 'es' ? country.nameEs : country.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Frequency */}
        <div className="mb-8">
          <h3 className="text-xl mb-4 pb-2 border-b border-neutral-200 dark:border-neutral-700">
            {t('frequency')}
          </h3>

          <div className="space-y-6">
            {/* Period selector */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
                {t('frequencyPeriodLabel')}
              </label>
              <div
                className="grid grid-cols-2 md:grid-cols-4 gap-2"
                role="group"
                aria-label={t('frequencyPeriodLabel')}
              >
                {[
                  { label: t('frequencyPeriods.weekly'), value: 'weekly' as FrequencyPeriod },
                  { label: t('frequencyPeriods.monthly'), value: 'monthly' as FrequencyPeriod },
                  { label: t('frequencyPeriods.quarterly'), value: 'quarterly' as FrequencyPeriod },
                  { label: t('frequencyPeriods.yearly'), value: 'yearly' as FrequencyPeriod },
                ].map((period) => (
                  <button
                    key={period.value}
                    type="button"
                    onClick={() => updateFrequencyPeriod(period.value)}
                    aria-pressed={formData.frequencyPeriod === period.value}
                    className={`px-4 py-2 rounded-lg border transition-colors ${
                      formData.frequencyPeriod === period.value
                        ? 'bg-primary-600 text-white border-primary-600 dark:bg-primary-400 dark:text-neutral-900'
                        : 'bg-white border-neutral-300 hover:border-primary-400 dark:bg-neutral-700 dark:border-neutral-600 dark:hover:border-neutral-500'
                    }`}
                  >
                    {period.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Times per period */}
            <div>
              <label
                htmlFor="times-per-period"
                className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2"
              >
                {t('timesPerPeriodLabel')}
              </label>
              <input
                id="times-per-period"
                type="number"
                min="1"
                max={getMaxTimesForPeriod(formData.frequencyPeriod || 'monthly')}
                value={
                  formData.timesPerPeriod === 0 || !formData.timesPerPeriod
                    ? ''
                    : formData.timesPerPeriod
                }
                onChange={(e) => {
                  const value = e.target.value === '' ? null : parseInt(e.target.value);
                  updateTimesPerPeriod(value);
                }}
                className={`input-field max-w-xs ${validationErrors['timesPerPeriod'] ? 'border-red-500' : ''}`}
                placeholder="1"
              />
              {validationErrors['timesPerPeriod'] && (
                <p className="text-xs text-red-600 mt-1">{validationErrors['timesPerPeriod']}</p>
              )}
              <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                {t('timesPerPeriodNote', {
                  max: getMaxTimesForPeriod(formData.frequencyPeriod || 'monthly'),
                  period: t(
                    `frequencyPeriods.${formData.frequencyPeriod || 'monthly'}`
                  ).toLowerCase(),
                })}
              </p>
            </div>

            {/* Visual summary */}
            <div className="p-4 bg-primary-50 dark:bg-neutral-700 rounded-lg border border-primary-200 dark:border-neutral-600">
              <p className="text-sm text-primary-900 dark:text-neutral-100">
                <span className="font-semibold">{t('frequencySummary')}:</span>{' '}
                {formData.timesPerPeriod || 1}{' '}
                {t(`frequencyTimes.${formData.frequencyPeriod || 'monthly'}`)} ={' '}
                <span className="font-bold">{formData.visitsPerYear}</span> {t('visitsPerYear')}
              </p>
            </div>
          </div>
        </div>

        {/* Validation Errors Summary */}
        {Object.keys(validationErrors).length > 0 && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <h4 className="text-sm font-semibold text-red-800 mb-2">
              {locale === 'es'
                ? 'Por favor corrige los siguientes errores:'
                : 'Please fix the following errors:'}
            </h4>
            <ul className="text-sm text-red-700 space-y-1">
              {Object.entries(validationErrors).map(([key, message]) => (
                <li key={key}>• {message}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Direct mode option */}
        <div className="mb-8 p-4 bg-neutral-50 dark:bg-neutral-700 rounded-lg">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={directMode}
              onChange={(e) => setDirectMode(e.target.checked)}
              className="mt-1"
            />
            <div>
              <span className="font-medium text-neutral-900 dark:text-neutral-100">
                {t('directMode')}
              </span>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                {t('directModeHelp')}
              </p>
            </div>
          </label>
        </div>

        <div className="flex justify-center">
          <button type="submit" className="btn-primary">
            {t('calculate')}
          </button>
        </div>
      </form>

      {/* Results */}
      {showResults && (
        <div
          ref={resultsRef}
          className="mt-12 scroll-mt-20"
          role="region"
          aria-label={t('resultsRegion') || 'Results'}
        >
          <h2 ref={resultsHeadingRef} tabIndex={-1} className="sr-only">
            {t('resultsHeading') || 'Calculation Results'}
          </h2>
          <ErrorBoundary>
            <Results input={formData} directMode={directMode} />
          </ErrorBoundary>
        </div>
      )}
    </div>
  );
}
