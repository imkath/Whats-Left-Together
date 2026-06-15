'use client';

import { useEffect, useRef, useState, useId } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { InfoCircle, ArrowRight, ArrowLeft } from '@solar-icons/react';
import type { RelationshipInput, Sex, RelationType, FrequencyPeriod } from '@/types';
import Results from './Results';
import ErrorBoundary from './ErrorBoundary';
import CountryField from './CountryField';
import { getAvailableCountries } from '@/lib/data';
import { getMaxTimesForPeriod, calculateVisitsPerYear } from '@/lib/utils/frequency';
import { buildRelationshipInputSchema } from '@/lib/validation/schemas';
import type { ZodError } from 'zod';

const TOTAL_STEPS = 4;

const RELATIONS: RelationType[] = [
  'mother',
  'father',
  'grandmother_maternal',
  'grandmother_paternal',
  'grandfather_maternal',
  'grandfather_paternal',
  'partner',
  'friend',
  'other_family',
  'other',
];

// One-tap frequency presets. The manual controls stay available as "advanced".
const PRESETS: { key: string; period: FrequencyPeriod; times: number }[] = [
  { key: 'presetDaily', period: 'weekly', times: 6 },
  { key: 'presetWeekly', period: 'weekly', times: 1 },
  { key: 'presetMonthly', period: 'monthly', times: 1 },
  { key: 'presetRarely', period: 'yearly', times: 3 },
];

const SEG_ACTIVE =
  'bg-neutral-900 text-neutral-50 dark:bg-neutral-100 dark:text-neutral-900 border-transparent shadow-sm';
const SEG_INACTIVE =
  'bg-transparent text-neutral-600 dark:text-neutral-300 border-neutral-300 dark:border-neutral-600 hover:border-neutral-400 dark:hover:border-neutral-500';

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
        className="p-0.5 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-presence focus-visible:ring-offset-1"
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
        className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 text-xs bg-neutral-800 dark:bg-neutral-200 text-neutral-50 dark:text-neutral-800 rounded-md w-64 text-center z-10 whitespace-normal transition-opacity ${
          isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {content}
      </span>
    </span>
  );
}

function SexToggle({
  value,
  onChange,
  labelFemale,
  labelMale,
  ariaLabel,
}: {
  value: Sex;
  onChange: (s: Sex) => void;
  labelFemale: string;
  labelMale: string;
  ariaLabel: string;
}) {
  return (
    <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label={ariaLabel}>
      {(['female', 'male'] as Sex[]).map((s) => (
        <button
          key={s}
          type="button"
          role="radio"
          aria-checked={value === s}
          onClick={() => onChange(s)}
          className={`px-4 py-3 rounded-xl border text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-presence ${
            value === s ? SEG_ACTIVE : SEG_INACTIVE
          }`}
        >
          {s === 'female' ? labelFemale : labelMale}
        </button>
      ))}
    </div>
  );
}

export default function Calculator() {
  const t = useTranslations('calculator');
  const tw = useTranslations('calculator.wizard');
  const tValidation = useTranslations('validation');
  const locale = useLocale() as 'es' | 'en';
  const countries = getAvailableCountries();

  const resultsRef = useRef<HTMLDivElement>(null);
  const resultsHeadingRef = useRef<HTMLHeadingElement>(null);
  const errorSummaryRef = useRef<HTMLDivElement>(null);
  const stepHeadingRef = useRef<HTMLHeadingElement>(null);
  const yourSexTooltipId = useId();
  const theirSexTooltipId = useId();

  const [formData, setFormData] = useState<RelationshipInput>({
    you: { age: 30, sex: 'female', country: 'CHL' },
    them: { age: 75, sex: 'female', country: 'CHL', name: '' },
    relationType: 'grandmother_maternal',
    visitsPerYear: 12,
    frequencyPeriod: 'monthly',
    timesPerPeriod: 1,
  });

  const [step, setStep] = useState(1);
  const [youDiffCountry, setYouDiffCountry] = useState(false);
  const [showCustomFreq, setShowCustomFreq] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const displayName = formData.them.name?.trim();

  // Move focus to the step heading on step change (screen readers + keyboard).
  useEffect(() => {
    stepHeadingRef.current?.focus();
  }, [step]);

  const update = (section: 'you' | 'them', field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [section]: { ...prev[section], [field]: value } }));
  };

  const setThemCountry = (code: string) => {
    setFormData((prev) => ({
      ...prev,
      them: { ...prev.them, country: code },
      you: youDiffCountry ? prev.you : { ...prev.you, country: code },
    }));
  };

  const toggleYouElsewhere = (checked: boolean) => {
    setYouDiffCountry(checked);
    if (!checked) update('you', 'country', formData.them.country);
  };

  const applyPreset = (p: { period: FrequencyPeriod; times: number }) => {
    setShowCustomFreq(false);
    setFormData((prev) => ({
      ...prev,
      frequencyPeriod: p.period,
      timesPerPeriod: p.times,
      visitsPerYear: calculateVisitsPerYear(p.period, p.times),
    }));
  };
  const isPresetActive = (p: { period: FrequencyPeriod; times: number }) =>
    !showCustomFreq && formData.frequencyPeriod === p.period && formData.timesPerPeriod === p.times;

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
      setFormData((prev) => ({ ...prev, timesPerPeriod: 0, visitsPerYear: 0 }));
      return;
    }
    const validTimes = Math.min(Math.max(1, times), getMaxTimesForPeriod(period));
    setFormData((prev) => ({
      ...prev,
      timesPerPeriod: validTimes,
      visitsPerYear: calculateVisitsPerYear(period, validTimes),
    }));
  };

  const stepOfPath = (path: string) => {
    if (path.startsWith('them')) return 2;
    if (path.startsWith('you')) return 3;
    if (path === 'relationType') return 1;
    return 4;
  };

  const goBack = () => {
    setValidationErrors({});
    setStep((s) => Math.max(1, s - 1));
  };

  const goNext = () => {
    // Lightweight per-step gate: the age fields must be filled.
    const errs: Record<string, string> = {};
    if (step === 2 && (!formData.them.age || formData.them.age < 1))
      errs['them.age'] = tValidation('ageRequired');
    if (step === 3 && (!formData.you.age || formData.you.age < 1))
      errs['you.age'] = tValidation('ageRequired');
    if (Object.keys(errs).length) {
      setValidationErrors(errs);
      return;
    }
    setValidationErrors({});
    setStep((s) => Math.min(TOTAL_STEPS, s + 1));
  };

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    const schema = buildRelationshipInputSchema(tValidation);
    const result = schema.safeParse(formData);

    if (!result.success) {
      const errors: Record<string, string> = {};
      let firstStep: number | null = null;
      (result.error as ZodError).errors.forEach((err) => {
        const path = err.path.join('.');
        if (!errors[path]) errors[path] = err.message;
        const s = stepOfPath(path);
        if (firstStep === null || s < firstStep) firstStep = s;
      });
      setValidationErrors(errors);
      if (firstStep !== null && firstStep !== step) setStep(firstStep);
      setTimeout(() => errorSummaryRef.current?.focus(), 60);
      return;
    }

    setValidationErrors({});
    setShowResults(true);
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      resultsHeadingRef.current?.focus();
    }, 100);
  };

  const fieldError = (path: string) =>
    validationErrors[path] ? (
      <p className="text-xs text-neutral-700 dark:text-neutral-300 mt-1">
        {validationErrors[path]}
      </p>
    ) : null;
  const errClass = (path: string) =>
    validationErrors[path] ? 'border-neutral-800 dark:border-neutral-200' : '';

  const stepTitle =
    step === 1
      ? tw('step1Title')
      : step === 2
        ? displayName
          ? tw('step2TitleNamed', { name: displayName })
          : tw('step2Title')
        : step === 3
          ? tw('step3Title')
          : displayName
            ? tw('step4TitleNamed', { name: displayName })
            : tw('step4Title');

  const youCountryName = (() => {
    const c = countries.find((x) => x.code === formData.you.country);
    return c ? (locale === 'es' ? c.nameEs : c.name) : formData.you.country;
  })();

  return (
    <div id="calculator" className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-12 h-1 bg-presence mx-auto mb-4 rounded-full" />
        <h2 className="text-2xl md:text-4xl font-extrabold">{t('title')}</h2>
        <p className="text-neutral-500 dark:text-neutral-400 mt-3 max-w-xl mx-auto">
          {t('subtitle')}
        </p>
      </div>

      <form onSubmit={handleCalculate} className="max-w-xl mx-auto">
        <div className="bg-warm-50 dark:bg-neutral-800/50 rounded-2xl border border-neutral-200/80 dark:border-neutral-700/50 p-6 md:p-10">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex gap-1.5" aria-hidden="true">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                    i <= step ? 'bg-presence' : 'bg-neutral-200 dark:bg-neutral-700'
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-neutral-400 mt-2 tabular-nums">
              {tw('progress', { step, total: TOTAL_STEPS })}
            </p>
          </div>

          {/* Step heading */}
          <h3
            ref={stepHeadingRef}
            tabIndex={-1}
            className="text-xl md:text-2xl font-bold text-neutral-900 dark:text-neutral-100 outline-none"
          >
            {stepTitle}
          </h3>

          {/* Step body */}
          <div key={step} className="mt-6 space-y-5 animate-fade-in">
            {/* STEP 1 — who */}
            {step === 1 && (
              <>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 -mt-2">
                  {tw('step1Help')}
                </p>
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
                  >
                    {RELATIONS.map((r) => (
                      <option key={r} value={r}>
                        {t(`relations.${r}`)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="them-name"
                    className="block text-xs text-neutral-500 dark:text-neutral-400 mb-1.5"
                  >
                    {tw('nameLabel')}{' '}
                    <span className="text-neutral-400">({tw('nameOptional')})</span>
                  </label>
                  <input
                    id="them-name"
                    type="text"
                    maxLength={40}
                    value={formData.them.name || ''}
                    onChange={(e) => update('them', 'name', e.target.value)}
                    className="input-field"
                    placeholder={tw('namePlaceholder')}
                    autoComplete="off"
                  />
                </div>
              </>
            )}

            {/* STEP 2 — about them */}
            {step === 2 && (
              <>
                <div>
                  <label
                    htmlFor="their-age"
                    className="block text-xs text-neutral-500 dark:text-neutral-400 mb-1.5"
                  >
                    {displayName ? tw('ageOfNamed', { name: displayName }) : tw('ageOfGeneric')}
                  </label>
                  <input
                    id="their-age"
                    type="number"
                    inputMode="numeric"
                    min="0"
                    max="100"
                    value={formData.them.age === 0 ? '' : formData.them.age}
                    onChange={(e) =>
                      update('them', 'age', e.target.value === '' ? 0 : parseInt(e.target.value))
                    }
                    className={`input-field ${errClass('them.age')}`}
                    aria-invalid={!!validationErrors['them.age']}
                  />
                  {fieldError('them.age')}
                </div>
                <div>
                  <span className="flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400 mb-1.5">
                    {displayName
                      ? tw('theirSexNamed', { name: displayName })
                      : tw('theirSexGeneric')}
                    <AccessibleTooltip content={t('sexTooltip')} id={theirSexTooltipId} />
                  </span>
                  <SexToggle
                    value={formData.them.sex}
                    onChange={(s) => update('them', 'sex', s)}
                    labelFemale={t('female')}
                    labelMale={t('male')}
                    ariaLabel={tw('theirSexGeneric')}
                  />
                </div>
                <CountryField
                  label={
                    displayName
                      ? tw('countryOfNamed', { name: displayName })
                      : tw('countryOfGeneric')
                  }
                  value={formData.them.country}
                  onChange={setThemCountry}
                  countries={countries}
                  locale={locale}
                  placeholder={tw('countrySearch')}
                />
              </>
            )}

            {/* STEP 3 — about you */}
            {step === 3 && (
              <>
                <div>
                  <label
                    htmlFor="your-age"
                    className="block text-xs text-neutral-500 dark:text-neutral-400 mb-1.5"
                  >
                    {tw('yourAgeQ')}
                  </label>
                  <input
                    id="your-age"
                    type="number"
                    inputMode="numeric"
                    min="0"
                    max="100"
                    value={formData.you.age === 0 ? '' : formData.you.age}
                    onChange={(e) =>
                      update('you', 'age', e.target.value === '' ? 0 : parseInt(e.target.value))
                    }
                    className={`input-field ${errClass('you.age')}`}
                    aria-invalid={!!validationErrors['you.age']}
                  />
                  {fieldError('you.age')}
                </div>
                <div>
                  <span className="flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400 mb-1.5">
                    {tw('yourSexQ')}
                    <AccessibleTooltip content={t('sexTooltip')} id={yourSexTooltipId} />
                  </span>
                  <SexToggle
                    value={formData.you.sex}
                    onChange={(s) => update('you', 'sex', s)}
                    labelFemale={t('female')}
                    labelMale={t('male')}
                    ariaLabel={tw('yourSexQ')}
                  />
                </div>
                {!youDiffCountry ? (
                  <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700">
                    <span className="text-sm text-neutral-600 dark:text-neutral-300">
                      {tw('sameCountryNote')}
                      <span className="block text-xs text-neutral-400">{youCountryName}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleYouElsewhere(true)}
                      className="text-sm font-medium text-presence whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-presence rounded-sm"
                    >
                      {tw('youElsewhere')}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <CountryField
                      label={tw('countryYou')}
                      value={formData.you.country}
                      onChange={(code) => update('you', 'country', code)}
                      countries={countries}
                      locale={locale}
                      placeholder={tw('countrySearch')}
                    />
                    <button
                      type="button"
                      onClick={() => toggleYouElsewhere(false)}
                      className="text-xs text-neutral-500 dark:text-neutral-400 underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-presence rounded-sm"
                    >
                      {tw('sameCountryNote')}
                    </button>
                  </div>
                )}
              </>
            )}

            {/* STEP 4 — frequency */}
            {step === 4 && (
              <>
                <div className="grid grid-cols-2 gap-2">
                  {PRESETS.map((p) => (
                    <button
                      key={p.key}
                      type="button"
                      onClick={() => applyPreset(p)}
                      aria-pressed={isPresetActive(p)}
                      className={`px-4 py-3.5 rounded-xl border text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-presence ${
                        isPresetActive(p) ? SEG_ACTIVE : SEG_INACTIVE
                      }`}
                    >
                      {tw(p.key)}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setShowCustomFreq((v) => !v)}
                  aria-expanded={showCustomFreq}
                  className="text-sm font-medium text-neutral-500 dark:text-neutral-400 underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-presence rounded-sm"
                >
                  {tw('presetCustom')}
                </button>

                {showCustomFreq && (
                  <div className="space-y-4 pt-1">
                    <div
                      className="grid grid-cols-4 gap-1.5 bg-neutral-100 dark:bg-neutral-700/50 p-1 rounded-lg"
                      role="group"
                      aria-label={t('frequencyPeriodLabel')}
                    >
                      {(['weekly', 'monthly', 'quarterly', 'yearly'] as FrequencyPeriod[]).map(
                        (period) => (
                          <button
                            key={period}
                            type="button"
                            onClick={() => updateFrequencyPeriod(period)}
                            aria-pressed={formData.frequencyPeriod === period}
                            className={`px-2 py-2 rounded-md text-xs md:text-sm font-medium transition-colors duration-150 ${
                              formData.frequencyPeriod === period
                                ? 'bg-warm-50 dark:bg-neutral-600 text-neutral-900 dark:text-neutral-50 shadow-sm'
                                : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'
                            }`}
                          >
                            {t(`frequencyPeriods.${period}`)}
                          </button>
                        )
                      )}
                    </div>
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
                        inputMode="numeric"
                        min="1"
                        max={getMaxTimesForPeriod(formData.frequencyPeriod || 'monthly')}
                        value={
                          formData.timesPerPeriod === 0 || !formData.timesPerPeriod
                            ? ''
                            : formData.timesPerPeriod
                        }
                        onChange={(e) =>
                          updateTimesPerPeriod(
                            e.target.value === '' ? null : parseInt(e.target.value)
                          )
                        }
                        className={`input-field max-w-[140px] ${errClass('timesPerPeriod')}`}
                        placeholder="1"
                        aria-invalid={!!validationErrors['timesPerPeriod']}
                      />
                      {fieldError('timesPerPeriod')}
                    </div>
                  </div>
                )}

                <p className="text-xs text-neutral-400 dark:text-neutral-500">
                  {tw('freqExclude')}
                </p>

                <div className="flex items-center gap-3 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                  <span
                    className="w-2 h-2 rounded-full bg-presence flex-shrink-0"
                    aria-hidden="true"
                  />
                  <p className="text-sm text-neutral-700 dark:text-neutral-300">
                    {displayName
                      ? tw('summaryNamed', { name: displayName, visits: formData.visitsPerYear })
                      : tw('summaryGeneric', { visits: formData.visitsPerYear })}
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Per-step error summary */}
          {Object.keys(validationErrors).length > 0 && (
            <div
              ref={errorSummaryRef}
              tabIndex={-1}
              className="mt-5 p-4 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-presence"
              role="alert"
            >
              <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                {tValidation('summaryTitle')}
              </h4>
              <ul className="text-sm text-neutral-600 dark:text-neutral-400 space-y-1">
                {Object.entries(validationErrors).map(([key, message]) => (
                  <li key={key}>• {message}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between gap-3 mt-8">
            {step > 1 ? (
              <button
                type="button"
                onClick={goBack}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-presence transition-colors"
              >
                <ArrowLeft size={18} aria-hidden="true" />
                {tw('back')}
              </button>
            ) : (
              <span aria-hidden="true" />
            )}

            {step < TOTAL_STEPS ? (
              <button
                type="button"
                onClick={goNext}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-neutral-900 text-neutral-50 hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200 font-semibold rounded-full transition-colors duration-150 shadow-md hover:shadow-lg active:scale-[0.98] group"
              >
                {tw('next')}
                <ArrowRight
                  size={18}
                  className="group-hover:translate-x-1 transition-transform"
                  aria-hidden="true"
                />
              </button>
            ) : (
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 md:px-8 md:py-3.5 bg-neutral-900 text-neutral-50 hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200 font-semibold rounded-full transition-colors duration-150 shadow-md hover:shadow-lg active:scale-[0.98] text-base md:text-lg group"
              >
                {tw('calculate')}
                <ArrowRight
                  size={20}
                  className="group-hover:translate-x-1 transition-transform"
                  aria-hidden="true"
                />
              </button>
            )}
          </div>
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
