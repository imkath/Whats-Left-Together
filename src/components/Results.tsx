'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import type { RelationshipInput, CalculationResult } from '@/types';
import { calculateExpectedEncounters } from '@/lib/models/actuarial';
import { getLifeTable, getCountryName, hasLifeTableData, NetworkError } from '@/lib/data';
import VisualizationChart from './VisualizationChart';

// Error codes for i18n
type ErrorCode =
  | 'noDataForCountry'
  | 'ageExceedsYou'
  | 'ageExceedsThem'
  | 'calculationError'
  | 'networkError';

interface ResultsProps {
  input: RelationshipInput;
  directMode?: boolean;
}

export default function Results({ input, directMode = false }: ResultsProps) {
  const t = useTranslations('results');
  const locale = useLocale() as 'es' | 'en';
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorCode, setErrorCode] = useState<ErrorCode | null>(null);
  const [errorCountry, setErrorCountry] = useState<string | null>(null);

  useEffect(() => {
    async function calculate() {
      setLoading(true);
      setErrorCode(null);
      setErrorCountry(null);

      try {
        // Validate countries have data BEFORE attempting to load
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

        // Validate ages are within life table range
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

        // Load life tables
        const yourLifeTable = await getLifeTable(input.you.country, input.you.sex);
        const theirLifeTable = await getLifeTable(input.them.country, input.them.sex);

        // Calculate
        const calculation = calculateExpectedEncounters(input, yourLifeTable, theirLifeTable);

        setResult(calculation);
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
  }, [input, locale]);

  if (loading) {
    return (
      <div className="card text-center py-12" role="status" aria-live="polite" aria-busy="true">
        <div className="animate-pulse">
          <div
            className="w-16 h-16 bg-primary-200 dark:bg-neutral-700 rounded-full mx-auto mb-4"
            aria-hidden="true"
          ></div>
          <p className="text-neutral-600 dark:text-neutral-400">{t('errors.calculating')}</p>
        </div>
      </div>
    );
  }

  if (errorCode || !result) {
    const errorMessage = errorCode
      ? errorCode === 'noDataForCountry' && errorCountry
        ? t(`errors.${errorCode}`, { country: errorCountry })
        : t(`errors.${errorCode}`)
      : t('errors.unknown');

    return (
      <div className="card bg-red-50 border-red-200" role="alert" aria-live="assertive">
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <svg
              className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5"
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
              <h4 className="text-red-900 font-semibold mb-2">{t('errors.loadingTitle')}</h4>
              <p className="text-red-700">{errorMessage}</p>
              <div className="mt-4 pt-4 border-t border-red-200">
                <p className="text-sm text-red-800 mb-2">{t('errors.retrySuggestions')}</p>
                <ul className="text-sm text-red-700 space-y-1">
                  <li>• {t('errors.retryReload')}</li>
                  <li>• {t('errors.retryCountry')}</li>
                  <li>• {t('errors.retryLater')}</li>
                </ul>
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
  const yearsMin = Math.floor(result.yearsWithBothAlive.min);
  const yearsMax = Math.ceil(result.yearsWithBothAlive.max);

  // MODO NORMAL
  if (!directMode) {
    return (
      <div className="space-y-6">
        {/* Main result - Normal mode */}
        <div className="card bg-gradient-to-br from-primary-50 to-white dark:from-neutral-800 dark:to-neutral-900 border-primary-200 dark:border-neutral-700">
          <h3 className="text-2xl mb-6 text-center">
            Si todo sigue igual, podrías ver a {relationLabel} unas {min} a {max} veces más en tu
            vida.
          </h3>

          <div className="prose prose-neutral dark:prose-invert max-w-none">
            <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
              Según los datos de esperanza de vida para {countryName} y las edades de ambos, es
              razonable esperar que sigan con vida, al mismo tiempo, alrededor de{' '}
              <strong>
                {yearsMin} a {yearsMax} años más
              </strong>
              .
            </p>

            <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
              Si ves a {relationLabel} <strong>{input.visitsPerYear} veces al año</strong>, eso se
              traduce en un rango aproximado de{' '}
              <strong>
                {min} a {max} visitas presenciales futuras
              </strong>
              .
            </p>

            <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
              Es solo una estimación estadística, no conoce la salud real de ninguno, ni accidentes,
              ni cambios de vida. Pero sí te muestra algo cierto:{' '}
              <strong className="text-primary-700 dark:text-primary-400">
                el número no es infinito
              </strong>
              .
            </p>
          </div>
        </div>

        {/* Action suggestions */}
        <div className="card border-primary-300 dark:border-neutral-600 bg-primary-50 dark:bg-neutral-800">
          <h4 className="text-lg font-semibold mb-4">
            Puedes decidir qué hacer con esta información.
          </h4>

          <p className="text-neutral-700 dark:text-neutral-300 mb-3">Algunas personas eligen:</p>

          <ul className="space-y-2 text-neutral-700 dark:text-neutral-300">
            <li className="flex gap-3">
              <span className="text-primary-600 dark:text-primary-400">→</span>
              <span>Aumentar la frecuencia de visitas</span>
            </li>
            <li className="flex gap-3">
              <span className="text-primary-600 dark:text-primary-400">→</span>
              <span>Alargar el tiempo que pasan juntas en cada encuentro</span>
            </li>
            <li className="flex gap-3">
              <span className="text-primary-600 dark:text-primary-400">→</span>
              <span>O simplemente dejar de postergar una conversación importante</span>
            </li>
          </ul>
        </div>

        {/* Visualization */}
        <div className="card">
          <h4 className="text-lg font-semibold mb-4">Probabilidad de supervivencia año a año</h4>
          <VisualizationChart data={result.yearByYearSurvival} />
          <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-4">
            Este gráfico muestra la probabilidad de que ambos estén vivos en cada año futuro, basado
            en las tablas de vida de {result.assumptions.dataSource}.
          </p>
        </div>

        {/* Assumptions and disclaimers */}
        <div className="card bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700">
          <h4 className="text-sm font-semibold mb-3 text-neutral-800 dark:text-neutral-200">
            Qué calculamos y qué no
          </h4>

          <p className="text-sm text-neutral-700 dark:text-neutral-300 mb-3">
            <strong>Qué calculamos:</strong> Visitas presenciales esperadas entre dos personas,
            basadas en tablas de vida por edad, sexo y país.
          </p>

          <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 mb-2">
            Qué no hace esta herramienta:
          </p>

          <ul className="text-sm text-neutral-700 dark:text-neutral-300 space-y-2">
            <li className="flex gap-2">
              <span>•</span>
              <span>No predice cuándo morirá nadie</span>
            </li>
            <li className="flex gap-2">
              <span>•</span>
              <span>No debe usarse para decisiones médicas</span>
            </li>
            <li className="flex gap-2">
              <span>•</span>
              <span>No conoce enfermedades concretas ni factores individuales</span>
            </li>
            <li className="flex gap-2">
              <span>•</span>
              <span>La frecuencia de visitas se asume estable (en la vida real puede cambiar)</span>
            </li>
          </ul>

          <div className="mt-4 pt-4 border-t border-neutral-300 dark:border-neutral-600">
            <p className="text-xs text-neutral-700 dark:text-neutral-300 font-medium mb-2">
              Fuente de datos:
            </p>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-1">
              {result.assumptions.dataSource} ({result.assumptions.dataYear})
            </p>
            <a
              href="https://population.un.org/wpp/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
            >
              → Ver fuente oficial (ONU)
            </a>
          </div>

          <div className="mt-4">
            <a
              href="/methodology"
              className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 text-sm font-medium"
            >
              → Ver cómo funciona (metodología completa)
            </a>
          </div>
        </div>
      </div>
    );
  }

  // MODO DIRECTO
  // Determinar el mensaje según la cantidad de visitas
  const getDirectModeHeadline = () => {
    const avgVisits = (min + max) / 2;
    if (avgVisits <= 50) {
      return t('directMode.headlineFew', { relation: relationLabel });
    } else if (avgVisits <= 150) {
      return t('directMode.headlineSome', { relation: relationLabel, min, max });
    } else if (avgVisits <= 500) {
      return t('directMode.headlineMany', { relation: relationLabel });
    } else {
      return t('directMode.headlineLots', { relation: relationLabel });
    }
  };

  const getDirectModeBody = () => {
    const avgVisits = (min + max) / 2;
    if (avgVisits <= 100) {
      return t('directMode.bodyFew', { relation: relationLabel, min, max });
    } else {
      return t('directMode.bodyMany', { relation: relationLabel, min, max });
    }
  };

  return (
    <div className="space-y-6">
      {/* Main result - Direct mode */}
      <div className="card bg-gradient-to-br from-neutral-100 to-white dark:from-neutral-800 dark:to-neutral-900 border-neutral-400 dark:border-neutral-600">
        <h3 className="text-2xl mb-6 font-bold text-neutral-900 dark:text-neutral-100">
          {getDirectModeHeadline()}
        </h3>

        <div className="bg-white dark:bg-neutral-700 rounded-lg p-8 border-2 border-neutral-300 dark:border-neutral-600 mb-6">
          <p className="text-lg text-neutral-800 dark:text-neutral-200 leading-relaxed">
            {getDirectModeBody()}
          </p>
        </div>

        <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
          {t('directMode.closing')}
        </p>
      </div>

      {/* Visualization */}
      <div className="card">
        <h4 className="text-lg font-semibold mb-4">Probabilidad de supervivencia año a año</h4>
        <VisualizationChart data={result.yearByYearSurvival} />
        <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-4">
          Datos: {result.assumptions.dataSource} ({result.assumptions.dataYear})
        </p>
      </div>

      {/* Disclaimers - more concise in direct mode */}
      <div className="card bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700">
        <h4 className="text-sm font-semibold mb-3 text-neutral-800 dark:text-neutral-200">
          Qué no hace esta herramienta
        </h4>

        <ul className="text-sm text-neutral-700 dark:text-neutral-300 space-y-2">
          <li className="flex gap-2">
            <span>•</span>
            <span>No predice cuándo morirá nadie</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>No debe usarse para decisiones médicas</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>No conoce enfermedades concretas ni factores individuales</span>
          </li>
        </ul>

        <div className="mt-4">
          <a
            href="/methodology"
            className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 text-sm font-medium"
          >
            → Ver cómo funciona
          </a>
        </div>
      </div>
    </div>
  );
}
