'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Share, Pen, UserPlus, AltArrowDown } from '@solar-icons/react';
import type { RelationshipInput, CalculationResult } from '@/types';
import { calculateExpectedEncounters } from '@/lib/models/actuarial';
import { getLifeTable, getCountryName, hasLifeTableData, NetworkError } from '@/lib/data';
import VisitGrid from './VisitGrid';
import VisualizationChart from './VisualizationChart';

type ErrorCode =
  | 'noDataForCountry'
  | 'ageExceedsYou'
  | 'ageExceedsThem'
  | 'calculationError'
  | 'networkError';

interface ResultsProps {
  input: RelationshipInput;
  onEdit?: () => void;
  onRestart?: () => void;
}

const WHAT_IF: { key: string; perYear: number }[] = [
  { key: 'yearly3', perYear: 3 },
  { key: 'monthly', perYear: 12 },
  { key: 'biweekly', perYear: 24 },
  { key: 'weekly', perYear: 52 },
];

export default function Results({ input, onEdit, onRestart }: ResultsProps) {
  const t = useTranslations('results');
  const v = useTranslations('results.v2');
  const [copied, setCopied] = useState(false);
  const tRel = useTranslations('calculator.relShort');
  const locale = useLocale() as 'es' | 'en';
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorCode, setErrorCode] = useState<ErrorCode | null>(null);
  const [errorCountry, setErrorCountry] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const resultsContainerRef = useRef<HTMLDivElement>(null);
  const survivalIn5 = (() => {
    if (!result) return 0;
    const five = result.yearByYearSurvival.find((s) => s.year === 5);
    if (five) return Math.round(five.bothAlive * 100);
    const arr = result.yearByYearSurvival;
    return Math.round((arr[Math.min(4, arr.length - 1)]?.bothAlive ?? 0) * 100);
  })();

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
      <div
        className="py-16 border-t border-neutral-200 dark:border-neutral-700"
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <div className="flex gap-[3px]" aria-hidden="true">
          {Array.from({ length: 12 }, (_, i) => (
            <span
              key={i}
              className="loading-square w-3.5 h-3.5 rounded-[2px] bg-presence"
              style={{ animationDelay: `${i * 80}ms` }}
            />
          ))}
        </div>
        <p className="mt-4 text-neutral-500 dark:text-neutral-400">{t('errors.calculating')}</p>
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
      <div className="card" role="alert" aria-live="assertive">
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <svg
              className="w-6 h-6 text-neutral-500 dark:text-neutral-400 flex-shrink-0 mt-0.5"
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
              <h4 className="text-neutral-900 dark:text-neutral-100 font-semibold mb-2">
                {t('errors.loadingTitle')}
              </h4>
              <p className="text-neutral-600 dark:text-neutral-400">{errorMessage}</p>
              <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                <p className="text-sm text-neutral-700 dark:text-neutral-300 mb-2">
                  {t('errors.retrySuggestions')}
                </p>
                <ul className="text-sm text-neutral-600 dark:text-neutral-400 space-y-1 list-disc pl-5">
                  <li>{t('errors.retryReload')}</li>
                  <li>{t('errors.retryCountry')}</li>
                  <li>{t('errors.retryLater')}</li>
                </ul>
                <button onClick={() => setRetryCount((c) => c + 1)} className="mt-4 btn-secondary">
                  {t('errors.retry')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Personalized reference to the loved one: "tu abuela María" / "your grandmother María".
  const personName = input.them.name?.trim();
  const relKey = input.relationType === 'friend' ? `friend_${input.them.sex}` : input.relationType;
  const relWord = tRel(relKey);
  const relationRef =
    personName && input.relationType === 'other'
      ? personName
      : personName
        ? t('personNamed', { relation: relWord, name: personName })
        : input.relationType === 'other'
          ? t('relationLabels.other')
          : t('personGeneric', { relation: relWord });

  const min = result.expectedVisitsRange.p25;
  const max = result.expectedVisitsRange.p75;
  const median = result.expectedVisitsRange.p50;
  // Same p25-p75 band as the visit range, so both sentences describe one interval.
  const yearsMin = input.visitsPerYear > 0 ? Math.round(min / input.visitsPerYear) : 0;
  const yearsMax = input.visitsPerYear > 0 ? Math.round(max / input.visitsPerYear) : 0;
  const startYear = new Date().getFullYear();

  // Visits scale linearly with frequency (years both alive x visits per year), so
  // the alternatives are the same median at a different rate.
  const perVisit = input.visitsPerYear > 0 ? median / input.visitsPerYear : 0;
  const alternatives = WHAT_IF.map((w) => ({ ...w, total: Math.round(perVisit * w.perYear) }));
  if (!alternatives.some((a) => a.perYear === input.visitsPerYear)) {
    alternatives.push({ key: 'now', perYear: input.visitsPerYear, total: median });
    alternatives.sort((a, b) => a.perYear - b.perYear);
  }
  const maxAlt = Math.max(...alternatives.map((a) => a.total), 1);

  const shareUrl = `https://whatslefttogether.com/${locale}`;
  const handleShare = async () => {
    const text = v('shareText');
    try {
      if (navigator.share) {
        await navigator.share({ text, url: shareUrl });
        return;
      }
      await navigator.clipboard.writeText(`${text} ${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // The user closed the share sheet; nothing to do.
    }
  };

  return (
    <div className="animate-slide-up" ref={resultsContainerRef} tabIndex={-1}>
      {/* The number */}
      <section className="pt-12 md:pt-16 border-t border-neutral-200 dark:border-neutral-700">
        <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">{v('lead')}</p>
        <p className="mt-2 flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <span className="text-7xl md:text-[8rem] leading-none font-extrabold tracking-tight text-presence tabular-nums">
            {median.toLocaleString(locale)}
          </span>
          <span className="text-2xl md:text-4xl font-bold text-neutral-900 dark:text-neutral-100">
            {v('timesWith', { person: relationRef })}
          </span>
        </p>
        <div className="mt-6 max-w-[40rem] space-y-2 text-lg text-neutral-700 dark:text-neutral-300">
          <p>{v('range', { min: min.toLocaleString(locale), max: max.toLocaleString(locale) })}</p>
          <p className="text-base text-neutral-500 dark:text-neutral-400">
            {v('years', { yearsMin, yearsMax, visits: input.visitsPerYear })}
          </p>
        </div>

        <div className="mt-8 grid gap-2 sm:flex sm:flex-wrap">
          <button type="button" onClick={handleShare} className="btn-primary">
            <Share size={18} aria-hidden="true" />
            {copied ? v('copied') : v('share')}
          </button>
          <button type="button" onClick={onEdit} className="btn-secondary">
            <Pen size={18} aria-hidden="true" />
            {v('edit')}
          </button>
          <button type="button" onClick={onRestart} className="btn-secondary">
            <UserPlus size={18} aria-hidden="true" />
            {v('another')}
          </button>
        </div>
        <p className="sr-only" aria-live="polite">
          {copied ? v('copied') : ''}
        </p>
      </section>

      {/* Year by year */}
      <section className="mt-16 md:mt-20 grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)]">
        <div>
          <h3>{v('gridTitle')}</h3>
          <p className="mt-3 text-neutral-600 dark:text-neutral-400">{v('gridCaption')}</p>
          <dl className="mt-6 space-y-2 text-sm">
            <div className="flex items-center gap-2.5">
              <dt className="w-3 h-3 rounded-[2px] bg-presence" aria-hidden="true" />
              <dd className="text-neutral-700 dark:text-neutral-300">{v('legendOn')}</dd>
            </div>
            <div className="flex items-center gap-2.5">
              <dt
                className="w-3 h-3 rounded-[2px] bg-neutral-200/70 dark:bg-neutral-800"
                aria-hidden="true"
              />
              <dd className="text-neutral-700 dark:text-neutral-300">{v('legendOff')}</dd>
            </div>
          </dl>
          <p className="mt-6 text-sm text-neutral-500 dark:text-neutral-400">
            {v('gridAxis', { person: relationRef })}
          </p>
        </div>
        <VisitGrid
          survival={result.yearByYearSurvival}
          visitsPerYear={input.visitsPerYear}
          themAge={input.them.age}
          startYear={startYear}
          ariaLabel={(info) => v('gridAria', info)}
          moreLabel={(count) => v('gridMore', { count })}
          unitLabel={(n) => v('gridUnit', { n })}
        />
      </section>

      {/* What if */}
      <section className="mt-16 md:mt-20 grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)]">
        <div>
          <h3>{v('whatIfTitle')}</h3>
          <p className="mt-3 text-neutral-600 dark:text-neutral-400">{v('whatIfIntro')}</p>
        </div>
        <ul className="space-y-4">
          {alternatives.map((a) => {
            const isNow = a.perYear === input.visitsPerYear;
            return (
              <li key={a.key}>
                <div className="flex items-baseline justify-between gap-4 text-sm">
                  <span
                    className={
                      isNow
                        ? 'font-bold text-neutral-900 dark:text-neutral-100'
                        : 'text-neutral-700 dark:text-neutral-300'
                    }
                  >
                    {a.key === 'now' ? v('whatIfPerYear', { n: a.perYear }) : v(`freq.${a.key}`)}
                    {isNow && (
                      <span className="ml-1.5 font-normal text-neutral-500 dark:text-neutral-400">
                        ({v('whatIfNow')})
                      </span>
                    )}
                  </span>
                  <span
                    className={`tabular-nums ${isNow ? 'font-bold text-presence' : 'text-neutral-900 dark:text-neutral-100'}`}
                  >
                    {v('whatIfTimes', { count: a.total.toLocaleString(locale) })}
                  </span>
                </div>
                <div className="mt-1.5 h-3 surface overflow-hidden rounded-[2px]">
                  <div
                    className={`h-full rounded-[2px] ${isNow ? 'bg-presence' : 'bg-neutral-300 dark:bg-neutral-600'}`}
                    style={{ width: `${Math.max(1, (a.total / maxAlt) * 100)}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Survival curve */}
      <section className="mt-16 md:mt-20 grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)]">
        <div>
          <h3>{v('survivalTitle')}</h3>
          <p className="mt-3 text-3xl font-bold tabular-nums text-neutral-900 dark:text-neutral-100">
            {v('survivalIn5', { percent: survivalIn5 })}
          </p>
          <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">{t('chart.intro')}</p>
        </div>
        <div className="min-w-0">
          <VisualizationChart data={result.yearByYearSurvival} />
        </div>
      </section>

      {/* Caveats */}
      <details className="mt-16 md:mt-20 group border-y border-neutral-200 dark:border-neutral-700">
        <summary className="flex items-center justify-between gap-4 py-5 font-bold list-none [&::-webkit-details-marker]:hidden">
          {v('caveatsTitle')}
          <AltArrowDown
            size={20}
            aria-hidden="true"
            className="transition-transform duration-200 group-open:rotate-180"
          />
        </summary>
        <div className="pb-6 grid gap-6 md:grid-cols-2 text-sm text-neutral-700 dark:text-neutral-300">
          <p>
            <strong className="text-neutral-900 dark:text-neutral-100">
              {t('assumptions.whatLabel')}
            </strong>{' '}
            {t('assumptions.what')}
          </p>
          <div>
            <p className="font-bold text-neutral-900 dark:text-neutral-100 mb-2">
              {t('assumptions.whatNot')}
            </p>
            <ul className="space-y-1 list-disc pl-5 marker:text-neutral-400">
              <li>{t('assumptions.point1')}</li>
              <li>{t('assumptions.point2')}</li>
              <li>{t('assumptions.point3')}</li>
              <li>{t('assumptions.point4')}</li>
            </ul>
          </div>
          <div className="md:col-span-2 space-y-1 text-neutral-500 dark:text-neutral-400">
            <p>
              {v('source', {
                source: result.assumptions.dataSource,
                year: result.assumptions.dataYear,
              })}{' '}
              {v('nextRevision')}
            </p>
            <a
              href={`/${locale}/methodology`}
              className="inline-block font-medium text-neutral-900 dark:text-neutral-100 underline underline-offset-4"
            >
              {t('seeMethodology')}
            </a>
          </div>
        </div>
      </details>
    </div>
  );
}
