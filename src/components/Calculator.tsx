'use client';

import { useState, useRef, useId } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { InfoCircle, ArrowRight, Refresh, User, Heart, Calendar } from '@solar-icons/react';
import type { RelationshipInput, Sex, RelationType, FrequencyPeriod } from '@/types';
import Results from './Results';
import ErrorBoundary from './ErrorBoundary';
import { getAvailableCountries } from '@/lib/data';
import { getMaxTimesForPeriod, calculateVisitsPerYear } from '@/lib/utils/frequency';
import { relationshipInputSchema } from '@/lib/validation/schemas';
import type { ZodError } from 'zod';

function AccessibleTooltip({ content, id }: { content: string; id: string }) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        aria-describedby={isVisible ? id : undefined}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
        className="p-0.5 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-1"
        aria-label="More information"
      >
        <InfoCircle
          size={14}
          className="text-neutral-400 dark:text-neutral-500"
          aria-hidden="true"
        />
      </button>
      <span
        id={id}
        role="tooltip"
        className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 text-xs bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-800 rounded-md w-64 text-center z-10 whitespace-normal transition-opacity ${
          isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {content}
      </span>
    </span>
  );
}

export default function Calculator() {
  const t = useTranslations('calculator');
  const locale = useLocale();
  const countries = getAvailableCountries();
  const resultsRef = useRef<HTMLDivElement>(null);
  const resultsHeadingRef = useRef<HTMLHeadingElement>(null);
  const yourSexTooltipId = useId();
  const theirSexTooltipId = useId();

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
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});

    const result = relationshipInputSchema.safeParse(formData);

    if (!result.success) {
      const errors: Record<string, string> = {};
      (result.error as ZodError).errors.forEach((error) => {
        const path = error.path.join('.');
        errors[path] = error.message;
      });
      setValidationErrors(errors);
      return;
    }

    setShowResults(true);

    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
      setFormData((prev) => ({
        ...prev,
        timesPerPeriod: 0,
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
    <div id="calculator" className="space-y-6">
      {/* Section header */}
      <div className="text-center mb-8">
        <div className="w-12 h-1 bg-accent-500 mx-auto mb-4 rounded-full" />
        <h2 className="text-2xl md:text-4xl font-extrabold">{t('title')}</h2>
        <p className="text-neutral-500 dark:text-neutral-400 mt-3 max-w-xl mx-auto">
          {t('subtitle')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-neutral-800/50 rounded-2xl border border-neutral-200/80 dark:border-neutral-700/50 overflow-hidden">
          {/* Section 1: About you */}
          <div className="p-6 md:p-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-accent-100 dark:bg-accent-900/30 flex items-center justify-center">
                  <User
                    size={18}
                    weight="BoldDuotone"
                    className="text-accent-600 dark:text-accent-400"
                  />
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                  {t('yourInfo')}
                </h3>
              </div>
              <span className="text-xs text-neutral-400 tabular-nums">
                {t('stepLabel', { step: 1, total: 3 })}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 md:gap-4">
              <div>
                <label
                  htmlFor="your-age"
                  className="block text-xs text-neutral-500 dark:text-neutral-400 mb-1.5"
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
                  className="flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400 mb-1.5"
                >
                  {t('sex')}
                  <AccessibleTooltip content={t('sexTooltip')} id={yourSexTooltipId} />
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

              <div className="col-span-2">
                <label
                  htmlFor="your-country"
                  className="block text-xs text-neutral-500 dark:text-neutral-400 mb-1.5"
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

          {/* Divider */}
          <div className="border-t border-neutral-100 dark:border-neutral-700/50" />

          {/* Section 2: About them */}
          <div className="p-6 md:p-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-accent-100 dark:bg-accent-900/30 flex items-center justify-center">
                  <Heart
                    size={18}
                    weight="BoldDuotone"
                    className="text-accent-600 dark:text-accent-400"
                  />
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                  {t('theirInfo')}
                </h3>
              </div>
              <span className="text-xs text-neutral-400 tabular-nums">
                {t('stepLabel', { step: 2, total: 3 })}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 md:gap-4">
              <div>
                <label
                  htmlFor="relationship"
                  className="block text-xs text-neutral-500 dark:text-neutral-400 mb-1.5"
                >
                  {t('relationship')}
                </label>
                <select
                  id="relationship"
                  value={formData.relationType}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      relationType: e.target.value as RelationType,
                    }))
                  }
                  className="input-field"
                  required
                >
                  <option value="mother">{t('relations.mother')}</option>
                  <option value="father">{t('relations.father')}</option>
                  <option value="grandmother_maternal">
                    {t('relations.grandmother_maternal')}
                  </option>
                  <option value="grandmother_paternal">
                    {t('relations.grandmother_paternal')}
                  </option>
                  <option value="grandfather_maternal">
                    {t('relations.grandfather_maternal')}
                  </option>
                  <option value="grandfather_paternal">
                    {t('relations.grandfather_paternal')}
                  </option>
                  <option value="partner">{t('relations.partner')}</option>
                  <option value="friend">{t('relations.friend')}</option>
                  <option value="other_family">{t('relations.other_family')}</option>
                  <option value="other">{t('relations.other')}</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="their-age"
                  className="block text-xs text-neutral-500 dark:text-neutral-400 mb-1.5"
                >
                  {t('theirAge')}
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
                  className="flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400 mb-1.5"
                >
                  {t('theirSex')}
                  <AccessibleTooltip content={t('sexTooltip')} id={theirSexTooltipId} />
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
                  className="block text-xs text-neutral-500 dark:text-neutral-400 mb-1.5"
                >
                  {t('theirCountry')}
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

          {/* Divider */}
          <div className="border-t border-neutral-100 dark:border-neutral-700/50" />

          {/* Section 3: Frequency */}
          <div className="p-6 md:p-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-accent-100 dark:bg-accent-900/30 flex items-center justify-center">
                  <Calendar
                    size={18}
                    weight="BoldDuotone"
                    className="text-accent-600 dark:text-accent-400"
                  />
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                  {t('frequency')}
                </h3>
              </div>
              <span className="text-xs text-neutral-400 tabular-nums">
                {t('stepLabel', { step: 3, total: 3 })}
              </span>
            </div>

            <div className="space-y-4">
              {/* Period selector */}
              <div>
                <label className="block text-xs text-neutral-500 dark:text-neutral-400 mb-2">
                  {t('frequencyPeriodLabel')}
                </label>
                <div
                  className="grid grid-cols-4 gap-1.5 bg-neutral-100 dark:bg-neutral-700/50 p-1 rounded-lg"
                  role="group"
                  aria-label={t('frequencyPeriodLabel')}
                >
                  {[
                    { label: t('frequencyPeriods.weekly'), value: 'weekly' as FrequencyPeriod },
                    { label: t('frequencyPeriods.monthly'), value: 'monthly' as FrequencyPeriod },
                    {
                      label: t('frequencyPeriods.quarterly'),
                      value: 'quarterly' as FrequencyPeriod,
                    },
                    { label: t('frequencyPeriods.yearly'), value: 'yearly' as FrequencyPeriod },
                  ].map((period) => (
                    <button
                      key={period.value}
                      type="button"
                      onClick={() => updateFrequencyPeriod(period.value)}
                      aria-pressed={formData.frequencyPeriod === period.value}
                      className={`px-2 py-2 rounded-md text-xs md:text-sm font-medium transition-colors duration-150 ${
                        formData.frequencyPeriod === period.value
                          ? 'bg-white dark:bg-neutral-600 text-neutral-900 dark:text-white shadow-sm'
                          : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'
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
                  className="block text-xs text-neutral-500 dark:text-neutral-400 mb-1.5"
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
                  className={`input-field max-w-[140px] ${validationErrors['timesPerPeriod'] ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                  placeholder="1"
                />
                {validationErrors['timesPerPeriod'] && (
                  <p className="text-xs text-red-600 mt-1">{validationErrors['timesPerPeriod']}</p>
                )}
                <p className="text-xs text-neutral-400 mt-1">
                  {t('timesPerPeriodNote', {
                    max: getMaxTimesForPeriod(formData.frequencyPeriod || 'monthly'),
                    period: t(
                      `frequencyPeriods.${formData.frequencyPeriod || 'monthly'}`
                    ).toLowerCase(),
                  })}
                </p>
              </div>

              {/* Visual summary */}
              <div className="flex items-center gap-3 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                <Refresh size={20} weight="BoldDuotone" className="text-accent-500 flex-shrink-0" />
                <p className="text-sm text-neutral-700 dark:text-neutral-300">
                  {formData.timesPerPeriod || 1}{' '}
                  {(formData.timesPerPeriod || 1) === 1
                    ? t(`frequencyTimeSingular.${formData.frequencyPeriod || 'monthly'}`)
                    : t(`frequencyTimes.${formData.frequencyPeriod || 'monthly'}`)}{' '}
                  ={' '}
                  <span className="font-bold text-accent-600 dark:text-accent-400">
                    {formData.visitsPerYear}
                  </span>{' '}
                  {t('visitsPerYear')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Validation Errors Summary */}
        {Object.keys(validationErrors).length > 0 && (
          <div
            className="mt-4 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/50 rounded-lg"
            aria-live="polite"
            role="status"
          >
            <h4 className="text-sm font-semibold text-red-800 dark:text-red-300 mb-2">
              {locale === 'es'
                ? 'Por favor corrige los siguientes errores:'
                : 'Please fix the following errors:'}
            </h4>
            <ul className="text-sm text-red-700 dark:text-red-400 space-y-1">
              {Object.entries(validationErrors).map(([key, message]) => (
                <li key={key}>• {message}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Submit button */}
        <div className="flex justify-center pt-6">
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3.5 md:px-8 md:py-4 bg-accent-500 hover:bg-accent-400 text-neutral-900 font-semibold rounded-full transition-colors duration-150 shadow-md hover:shadow-lg active:scale-[0.98] text-base md:text-lg group"
          >
            {t('calculate')}
            <ArrowRight
              size={20}
              className="group-hover:translate-x-1 transition-transform"
              aria-hidden="true"
            />
          </button>
        </div>
      </form>

      {/* Results */}
      {showResults && (
        <div
          ref={resultsRef}
          className="mt-16 scroll-mt-20"
          role="region"
          aria-label={t('resultsRegion') || 'Results'}
        >
          <h2 ref={resultsHeadingRef} tabIndex={-1} className="sr-only">
            {t('resultsHeading') || 'Calculation Results'}
          </h2>
          <ErrorBoundary>
            <Results input={formData} />
          </ErrorBoundary>
        </div>
      )}
    </div>
  );
}
