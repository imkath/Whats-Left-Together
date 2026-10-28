'use client';

import { useEffect, useRef, useState, useId } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { InfoCircle, ArrowRight, ArrowLeft } from '@solar-icons/react';
import type { RelationshipInput, Sex, RelationType, FrequencyPeriod } from '@/types';
import Results from './Results';
import ErrorBoundary from './ErrorBoundary';
import CountryField from './CountryField';
import AgeField from './AgeField';
import { getAvailableCountries } from '@/lib/data';
import { getMaxTimesForPeriod, calculateVisitsPerYear } from '@/lib/utils/frequency';
import { buildRelationshipInputSchema } from '@/lib/validation/schemas';
import type { ZodError } from 'zod';

const TOTAL_STEPS = 4;

// Maternal/paternal only changed a label, so the choices collapse to one per role.
const RELATIONS: RelationType[] = [
  'mother',
  'father',
  'grandmother_maternal',
  'grandfather_maternal',
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
        className="p-0.5 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-700"
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
        className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 text-xs font-normal bg-neutral-900 dark:bg-neutral-100 text-neutral-50 dark:text-neutral-900 rounded-md w-64 text-left z-10 whitespace-normal transition-opacity ${
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
          className="choice text-center"
        >
          {s === 'female' ? labelFemale : labelMale}
        </button>
      ))}
    </div>
  );
}

const EMPTY_FORM: RelationshipInput = {
  you: { age: 30, sex: 'female', country: 'CHL' },
  them: { age: 75, sex: 'female', country: 'CHL', name: '' },
  relationType: 'grandmother_maternal',
  visitsPerYear: 12,
  frequencyPeriod: 'monthly',
  timesPerPeriod: 1,
};

export default function Calculator({ intro }: { intro?: React.ReactNode }) {
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

  const [formData, setFormData] = useState<RelationshipInput>(EMPTY_FORM);
  const formTopRef = useRef<HTMLDivElement>(null);

  const [step, setStep] = useState(1);
  const [youDiffCountry, setYouDiffCountry] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const displayName = formData.them.name?.trim();

  // Move focus to the step heading on step change (screen readers + keyboard).
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    stepHeadingRef.current?.focus({ preventScroll: true });
    // On phones the "next" button sits low; bring the new step's top back into view.
    const top = formTopRef.current?.getBoundingClientRect().top ?? 0;
    if (top < 56) formTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [step]);

  // Hide a previous result when the inputs change, so the visualization only
  // ever reflects a calculation the user explicitly asked for.
  useEffect(() => {
    setShowResults(false);
  }, [formData]);

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
    setFormData((prev) => ({
      ...prev,
      frequencyPeriod: p.period,
      timesPerPeriod: p.times,
      visitsPerYear: calculateVisitsPerYear(p.period, p.times),
    }));
  };
  const isPresetActive = (p: { period: FrequencyPeriod; times: number }) =>
    formData.frequencyPeriod === p.period && formData.timesPerPeriod === p.times;

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

  const backToForm = (reset: boolean) => {
    if (reset) {
      setFormData(EMPTY_FORM);
      setYouDiffCountry(false);
    }
    setShowResults(false);
    setValidationErrors({});
    setStep(1);
    setTimeout(() => {
      formTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      stepHeadingRef.current?.focus({ preventScroll: true });
    }, 50);
  };

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    // Enter inside an earlier step moves forward instead of calculating early.
    if (step < TOTAL_STEPS) {
      goNext();
      return;
    }
    const schema = buildRelationshipInputSchema(tValidation);
    const result = schema.safeParse(formData);

    if (!result.success) {
      const errors: Record<string, string> = {};
      let firstStep: number | null = null;
      (result.error as ZodError).issues.forEach((err) => {
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
      <p className="text-sm text-neutral-900 dark:text-neutral-100 mt-1.5">
        {validationErrors[path]}
      </p>
    ) : null;
  const errClass = (path: string) =>
    validationErrors[path] ? 'border-neutral-900 dark:border-neutral-100 border-2' : '';

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

  const stepNames = [1, 2, 3, 4].map((i) => tw(`stepNames.${i}`));
  const themCountryName = (() => {
    const c = countries.find((x) => x.code === formData.them.country);
    return c ? (locale === 'es' ? c.nameEs : c.name) : formData.them.country;
  })();

  return (
    <div className="space-y-16 md:space-y-24">
      <div className="grid grid-cols-[minmax(0,1fr)] gap-10 lg:gap-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,30rem)] items-start">
        {intro}

        <form onSubmit={handleCalculate} noValidate aria-labelledby="calc-title" className="w-full">
          <div ref={formTopRef} className="scroll-mt-20" />
          <h2 id="calc-title" className="sr-only">
            {t('title')}
          </h2>
          <div className="card">
            {/* Progress: one square per step, the same unit as the result. */}
            <ol
              className="flex items-center gap-4 mb-7 text-xs"
              aria-label={tw('progress', { step, total: TOTAL_STEPS })}
            >
              {stepNames.map((name, i) => {
                const n = i + 1;
                const state = n < step ? 'done' : n === step ? 'current' : 'todo';
                return (
                  <li
                    key={name}
                    aria-current={state === 'current' ? 'step' : undefined}
                    className={`flex items-center gap-1.5 ${
                      state === 'todo'
                        ? 'text-neutral-400 dark:text-neutral-500'
                        : 'text-neutral-900 dark:text-neutral-100'
                    } ${state === 'current' ? 'font-medium' : ''}`}
                  >
                    <span
                      aria-hidden="true"
                      className={`w-2.5 h-2.5 rounded-[2px] ${
                        state === 'done'
                          ? 'bg-neutral-900 dark:bg-neutral-100'
                          : state === 'current'
                            ? 'bg-presence'
                            : 'border border-neutral-300 dark:border-neutral-600'
                      }`}
                    />
                    <span className={state === 'current' ? '' : 'hidden sm:inline'}>{name}</span>
                  </li>
                );
              })}
            </ol>

            <h3
              ref={stepHeadingRef}
              tabIndex={-1}
              className="text-xl md:text-2xl font-bold text-neutral-900 dark:text-neutral-100 outline-none"
            >
              {stepTitle}
            </h3>

            {step > 1 && (
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                {displayName ? `${displayName} · ` : ''}
                {t(
                  `relationChoices.${formData.relationType === 'grandmother_paternal' ? 'grandmother_maternal' : formData.relationType === 'grandfather_paternal' ? 'grandfather_maternal' : formData.relationType}`
                )}
                {step > 2 &&
                  ` · ${tw('summaryThem', { age: formData.them.age, country: themCountryName })}`}
              </p>
            )}

            <div key={step} className="mt-6 space-y-6 animate-fade-in">
              {step === 1 && (
                <>
                  <div>
                    <span id="relation-label" className="field-label">
                      {tw('relationQ')}
                    </span>
                    <div
                      role="radiogroup"
                      aria-labelledby="relation-label"
                      className="grid grid-cols-2 gap-2"
                    >
                      {RELATIONS.map((r) => (
                        <button
                          key={r}
                          type="button"
                          role="radio"
                          aria-checked={formData.relationType === r}
                          onClick={() => setFormData((prev) => ({ ...prev, relationType: r }))}
                          className="choice"
                        >
                          {t(`relationChoices.${r}`)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label htmlFor="them-name" className="field-label">
                      {tw('nameLabel')}{' '}
                      <span className="font-normal text-neutral-500">({tw('nameOptional')})</span>
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
                      enterKeyHint="next"
                    />
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <AgeField
                    id="their-age"
                    ageLabel={
                      displayName ? tw('ageOfNamed', { name: displayName }) : tw('ageOfGeneric')
                    }
                    yearLabel={
                      displayName
                        ? tw('birthYearNamed', { name: displayName })
                        : tw('birthYearGeneric')
                    }
                    useBirthYearLabel={tw('useBirthYear')}
                    useAgeLabel={tw('useAge')}
                    yearPlaceholder={tw('birthYearPlaceholder')}
                    age={formData.them.age}
                    onAge={(a) => update('them', 'age', a)}
                    invalid={!!validationErrors['them.age']}
                    error={fieldError('them.age')}
                  />
                  <div>
                    <span className="field-label flex items-center gap-1">
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

              {step === 3 && (
                <>
                  <AgeField
                    id="your-age"
                    ageLabel={tw('yourAgeQ')}
                    yearLabel={tw('yourBirthYear')}
                    useBirthYearLabel={tw('useBirthYear')}
                    useAgeLabel={tw('useAge')}
                    yearPlaceholder={tw('birthYearPlaceholder')}
                    age={formData.you.age}
                    onAge={(a) => update('you', 'age', a)}
                    invalid={!!validationErrors['you.age']}
                    error={fieldError('you.age')}
                  />
                  <div>
                    <span className="field-label flex items-center gap-1">
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
                    <div className="flex items-center justify-between gap-3 px-4 py-3 surface">
                      <span className="text-sm text-neutral-700 dark:text-neutral-300">
                        {tw('sameCountryNote')}
                        <span className="block text-neutral-500 dark:text-neutral-400">
                          {youCountryName}
                        </span>
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleYouElsewhere(true)}
                        className="text-sm font-medium text-neutral-900 dark:text-neutral-100 underline underline-offset-4 whitespace-nowrap rounded-sm"
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
                        className="text-sm text-neutral-600 dark:text-neutral-400 underline underline-offset-4 rounded-sm"
                      >
                        {tw('sameCountryNote')}
                      </button>
                    </div>
                  )}
                </>
              )}

              {step === 4 && (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    {PRESETS.map((p) => (
                      <button
                        key={p.key}
                        type="button"
                        onClick={() => applyPreset(p)}
                        aria-pressed={isPresetActive(p)}
                        className="choice"
                      >
                        {tw(p.key)}
                      </button>
                    ))}
                  </div>

                  <fieldset className="space-y-3">
                    <legend className="text-sm text-neutral-500 dark:text-neutral-400 mb-3">
                      {tw('orExact')}
                    </legend>
                    <div className="flex flex-wrap items-end gap-3">
                      <div>
                        <label htmlFor="times-per-period" className="sr-only">
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
                          className={`input-field w-20 text-center ${errClass('timesPerPeriod')}`}
                          placeholder="1"
                          aria-invalid={!!validationErrors['timesPerPeriod']}
                        />
                      </div>
                      <div
                        className="flex-1 min-w-[14rem] grid grid-cols-4 gap-1 p-1 surface"
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
                              className={`px-1 py-2 rounded-[4px] text-xs sm:text-sm font-medium transition-colors duration-150 ${
                                formData.frequencyPeriod === period
                                  ? 'bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-50'
                                  : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
                              }`}
                            >
                              {t(`frequencyPeriods.${period}`)}
                            </button>
                          )
                        )}
                      </div>
                    </div>
                    {fieldError('timesPerPeriod')}
                  </fieldset>

                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    {tw('freqExclude')}
                  </p>

                  <p className="flex items-center gap-2.5 text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    <span
                      className="w-2.5 h-2.5 rounded-[2px] bg-presence flex-shrink-0"
                      aria-hidden="true"
                    />
                    {displayName
                      ? tw('summaryNamed', { name: displayName, visits: formData.visitsPerYear })
                      : tw('summaryGeneric', { visits: formData.visitsPerYear })}
                  </p>
                </>
              )}
            </div>

            {Object.keys(validationErrors).length > 0 && (
              <div
                ref={errorSummaryRef}
                tabIndex={-1}
                className="mt-6 px-4 py-3 surface border border-neutral-900 dark:border-neutral-100"
                role="alert"
              >
                <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 mb-1">
                  {tValidation('summaryTitle')}
                </h4>
                <ul className="text-sm text-neutral-700 dark:text-neutral-300 space-y-1">
                  {Object.entries(validationErrors).map(([key, message]) => (
                    <li key={key}>{message}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex items-center justify-between gap-3 mt-8 pt-6 border-t border-neutral-200 dark:border-neutral-700">
              {step > 1 ? (
                <button type="button" onClick={goBack} className="btn-quiet -ml-3">
                  <ArrowLeft size={18} aria-hidden="true" />
                  {tw('back')}
                </button>
              ) : (
                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                  {tw('keepGoing')}
                </span>
              )}

              {step < TOTAL_STEPS ? (
                // Distinct keys: if React reused this node, its type would flip to
                // "submit" mid-click and the step-3 "next" would submit the form.
                <button key="next" type="button" onClick={goNext} className="btn-primary">
                  {tw('next')}
                  <ArrowRight size={18} aria-hidden="true" />
                </button>
              ) : (
                <button key="submit" type="submit" className="btn-primary whitespace-nowrap px-5">
                  {tw('calculate')}
                  <ArrowRight size={18} aria-hidden="true" />
                </button>
              )}
            </div>
          </div>
        </form>
      </div>

      {showResults && (
        <div
          ref={resultsRef}
          className="scroll-mt-16"
          role="region"
          aria-label={t('resultsRegion') || 'Results'}
        >
          <h2 ref={resultsHeadingRef} tabIndex={-1} className="sr-only">
            {t('resultsHeading') || 'Calculation Results'}
          </h2>
          <ErrorBoundary>
            <Results
              input={formData}
              onEdit={() => backToForm(false)}
              onRestart={() => backToForm(true)}
            />
          </ErrorBoundary>
        </div>
      )}
    </div>
  );
}
