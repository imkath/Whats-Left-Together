'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { ClockCircle, Heart, Calendar, Share, Pen, AltArrowRight } from '@solar-icons/react';
import type { RelationshipInput, CalculationResult } from '@/types';
import { calculateExpectedEncounters } from '@/lib/models/actuarial';
import { getLifeTable, getCountryName, hasLifeTableData, NetworkError } from '@/lib/data';
import DotVisualization from './DotVisualization';
import VisualizationChart from './VisualizationChart';

type ErrorCode =
  | 'noDataForCountry'
  | 'ageExceedsYou'
  | 'ageExceedsThem'
  | 'calculationError'
  | 'networkError';

interface ResultsProps {
  input: RelationshipInput;
}

export default function Results({ input }: ResultsProps) {
  const t = useTranslations('results');
  const locale = useLocale() as 'es' | 'en';
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorCode, setErrorCode] = useState<ErrorCode | null>(null);
  const [errorCountry, setErrorCountry] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const resultsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function calculate() {
      setLoading(true);
      setErrorCode(null);
      setErrorCountry(null);

      try {
        if (!hasLifeTableData(input.you.country)) {
          setErrorCode('noDataForCountry');
          setErrorCountry(getCountryName(input.you.country, locale));
          setLoading(false);
          return;
        }

        if (!hasLifeTableData(input.them.country)) {
          setErrorCode('noDataForCountry');
          setErrorCountry(getCountryName(input.them.country, locale));
          setLoading(false);
          return;
        }

        if (input.you.age > 100) {
          setErrorCode('ageExceedsYou');
          setLoading(false);
          return;
        }

        if (input.them.age > 100) {
          setErrorCode('ageExceedsThem');
          setLoading(false);
          return;
        }

        const yourLifeTable = await getLifeTable(input.you.country, input.you.sex);
        const theirLifeTable = await getLifeTable(input.them.country, input.them.sex);
        const calculation = calculateExpectedEncounters(input, yourLifeTable, theirLifeTable);
        setResult(calculation);

        if (retryCount > 0) {
          setTimeout(() => {
            resultsContainerRef.current?.focus();
          }, 100);
        }
      } catch (err) {
        if (err instanceof NetworkError) {
          setErrorCode('networkError');
        } else {
          setErrorCode('calculationError');
        }
      } finally {
        setLoading(false);
      }
    }

    calculate();
  }, [input, locale, retryCount]);

  // Loading state
  if (loading) {
    return (
      <div className="text-center py-16" role="status" aria-live="polite" aria-busy="true">
        <div className="animate-pulse motion-reduce:animate-none">
          <div className="w-20 h-20 rounded-full bg-accent-500/20 mx-auto mb-6 flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-accent-500/40" />
          </div>
        </div>
        <p className="text-neutral-500 dark:text-neutral-400 text-lg">{t('errors.calculating')}</p>
      </div>
    );
  }

  // Error state
  if (errorCode || !result) {
    const errorMessage = errorCode
      ? errorCode === 'noDataForCountry' && errorCountry
        ? t(`errors.${errorCode}`, { country: errorCountry })
        : t(`errors.${errorCode}`)
      : t('errors.unknown');

    return (
      <div
        className="card bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800/50"
        role="alert"
        aria-live="assertive"
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <svg
              className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="flex-1">
              <h4 className="text-red-900 dark:text-red-200 font-semibold mb-2">
                {t('errors.loadingTitle')}
              </h4>
              <p className="text-red-700 dark:text-red-300">{errorMessage}</p>
              <div className="mt-4 pt-4 border-t border-red-200 dark:border-red-800/50">
                <p className="text-sm text-red-800 dark:text-red-300 mb-2">
                  {t('errors.retrySuggestions')}
                </p>
                <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                  <li>• {t('errors.retryReload')}</li>
                  <li>• {t('errors.retryCountry')}</li>
                  <li>• {t('errors.retryLater')}</li>
                </ul>
                <button
                  onClick={() => setRetryCount((c) => c + 1)}
                  className="mt-3 px-4 py-2 text-sm font-medium text-red-700 dark:text-red-300 border border-red-300 dark:border-red-700 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors focus-visible:ring-2 focus-visible:ring-accent-500 outline-none"
                >
                  {t('errors.retry')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const relationLabel = t(`relationLabels.${input.relationType}`) || t('relationLabels.other');
  const countryName = getCountryName(input.them.country, locale);

  const min = result.expectedVisitsRange.p25;
  const max = result.expectedVisitsRange.p75;
  const median = result.expectedVisitsRange.p50;
  const yearsMin = Math.floor(result.yearsWithBothAlive.min);
  const yearsMax = Math.ceil(result.yearsWithBothAlive.max);

  // Calculate 5-year survival probability
  const fiveYearSurvival = result.yearByYearSurvival.find((s) => s.year === 5);
  const survivalPercent = fiveYearSurvival
    ? Math.round(fiveYearSurvival.bothAlive * 100)
    : Math.round(
        result.yearByYearSurvival[Math.min(4, result.yearByYearSurvival.length - 1)]?.bothAlive *
          100
      ) || 0;

  return (
    <div className="space-y-8 animate-slide-up" ref={resultsContainerRef} tabIndex={-1}>
      {/* Section title */}
      <div className="text-center">
        <h3 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
          {t('visualization.title')}
        </h3>
      </div>

      {/* Dot Visualization with caption below */}
      <div className="space-y-4">
        <div className="rounded-lg overflow-hidden shadow-md">
          <DotVisualization totalDots={median} label={t('visualization.yAxisLabel')} />
        </div>

        <p className="text-center text-lg md:text-xl lg:text-2xl font-bold text-neutral-900 dark:text-white leading-snug px-4">
          {t('visualization.overlayLine1')}{' '}
          <span className="text-accent-500 dark:text-accent-400">
            {t('visualization.overlayCount', { count: median })}
          </span>{' '}
          {t('visualization.overlayLine2')}
        </p>
      </div>

      {/* Stat card - Estimated range */}
      <div className="stat-card">
        <div className="flex items-start justify-between mb-4">
          <h4 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
            {t('stats.rangeTitle')}
          </h4>
          <ClockCircle size={20} weight="BoldDuotone" className="text-accent-500" />
        </div>
        <p className="text-4xl md:text-5xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
          {min} <span className="text-neutral-400 dark:text-neutral-500">-</span> {max}
        </p>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
          {t('stats.rangeSubtitle')}
        </p>
      </div>

      {/* Contextual explanation */}
      <div className="card bg-gradient-to-br from-neutral-50 to-white dark:from-neutral-800/50 dark:to-neutral-900 border-neutral-200 dark:border-neutral-700/50">
        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-4">
          <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
            {t('normalMode.para1', { country: countryName, yearsMin, yearsMax })}
          </p>
          <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
            {t('normalMode.para2', {
              relation: relationLabel,
              frequency: input.visitsPerYear,
              min,
              max,
            })}
          </p>
          <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
            {t('normalMode.para3_main')}{' '}
            <strong className="text-accent-600 dark:text-accent-400">
              {t('normalMode.para3_emphasis')}
            </strong>
            .
          </p>
        </div>
      </div>

      {/* What can you do? - Action section */}
      <div className="text-center mb-2">
        <h3 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-neutral-100">
          {t('actions.title')}
        </h3>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="action-card group">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-accent-100 dark:bg-accent-900/30 flex items-center justify-center">
            <Calendar
              size={20}
              weight="BoldDuotone"
              className="text-accent-600 dark:text-accent-400"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
              {t('actions.plan.title')}
            </h4>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              {t('actions.plan.description')}
            </p>
          </div>
          <AltArrowRight
            size={18}
            className="text-neutral-300 dark:text-neutral-600 group-hover:text-accent-500 transition-colors flex-shrink-0 mt-1"
          />
        </div>

        <div className="action-card group">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-accent-100 dark:bg-accent-900/30 flex items-center justify-center">
            <Share
              size={20}
              weight="BoldDuotone"
              className="text-accent-600 dark:text-accent-400"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
              {t('actions.share.title')}
            </h4>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              {t('actions.share.description')}
            </p>
          </div>
          <AltArrowRight
            size={18}
            className="text-neutral-300 dark:text-neutral-600 group-hover:text-accent-500 transition-colors flex-shrink-0 mt-1"
          />
        </div>

        <div className="action-card group">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-accent-100 dark:bg-accent-900/30 flex items-center justify-center">
            <Pen size={20} weight="BoldDuotone" className="text-accent-600 dark:text-accent-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
              {t('actions.write.title')}
            </h4>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              {t('actions.write.description')}
            </p>
          </div>
          <AltArrowRight
            size={18}
            className="text-neutral-300 dark:text-neutral-600 group-hover:text-accent-500 transition-colors flex-shrink-0 mt-1"
          />
        </div>
      </div>

      {/* Survival probability + chart unified block */}
      <div className="rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-700/50 bg-white dark:bg-neutral-900">
        {/* Header with stat */}
        <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-end gap-4 md:gap-8">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <Heart size={18} weight="BoldDuotone" className="text-accent-500" />
              <h4 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                {t('stats.survivalTitle')}
              </h4>
            </div>
            <p className="text-4xl md:text-5xl font-bold text-neutral-900 dark:text-white tracking-tight">
              {survivalPercent}%
            </p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              {t('stats.survivalSubtitle')}
            </p>
          </div>
          <p className="text-sm text-neutral-400 dark:text-neutral-500 max-w-sm">
            {t('chart.intro')}
          </p>
        </div>

        {/* Chart area */}
        <div className="px-2 pb-4 md:px-4 md:pb-6">
          <VisualizationChart data={result.yearByYearSurvival} />
        </div>

        <div className="px-6 pb-5 md:px-8 md:pb-6">
          <p className="text-xs text-neutral-400 dark:text-neutral-500">
            {t('chart.description', { source: result.assumptions.dataSource })}
          </p>
        </div>
      </div>

      {/* Assumptions / disclaimers - minimal and clean */}
      <div className="rounded-lg bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700/50 p-6">
        <h4 className="text-sm font-semibold mb-3 text-neutral-700 dark:text-neutral-300">
          {t('assumptions.title')}
        </h4>

        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-neutral-600 dark:text-neutral-400 mb-2">
              <strong className="text-neutral-700 dark:text-neutral-300">
                {t('assumptions.whatLabel')}
              </strong>{' '}
              {t('assumptions.what')}
            </p>
          </div>
          <div>
            <p className="font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              {t('assumptions.whatNot')}:
            </p>
            <ul className="text-neutral-600 dark:text-neutral-400 space-y-1">
              <li className="flex gap-2">
                <span className="text-neutral-400">•</span>
                <span>{t('assumptions.point1')}</span>
              </li>
              <li className="flex gap-2">
                <span className="text-neutral-400">•</span>
                <span>{t('assumptions.point2')}</span>
              </li>
              <li className="flex gap-2">
                <span className="text-neutral-400">•</span>
                <span>{t('assumptions.point3')}</span>
              </li>
              <li className="flex gap-2">
                <span className="text-neutral-400">•</span>
                <span>{t('assumptions.point4')}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700/50 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {result.assumptions.dataSource} ({result.assumptions.dataYear})
            </p>
            <a
              href="/methodology"
              className="text-sm font-medium text-accent-600 hover:text-accent-700 dark:text-accent-400 dark:hover:text-accent-300 transition-colors"
            >
              {t('seeMethodology')}
            </a>
          </div>
          <p className="text-xs text-neutral-400 dark:text-neutral-500 italic">
            {t('assumptions.dataFreshness')}
          </p>
        </div>
      </div>
    </div>
  );
}
