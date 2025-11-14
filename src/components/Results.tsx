'use client';

import { useEffect, useState } from 'react';
import type { RelationshipInput, CalculationResult } from '@/types';
import { calculateExpectedEncounters } from '@/lib/models/actuarial';
import { getLifeTable, getCountryName } from '@/lib/data';
import VisualizationChart from './VisualizationChart';

interface ResultsProps {
  input: RelationshipInput;
  directMode?: boolean;
}

export default function Results({ input, directMode = false }: ResultsProps) {
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function calculate() {
      setLoading(true);
      setError(null);

      try {
        // Load life tables
        const yourLifeTable = await getLifeTable(input.you.country, input.you.sex);
        const theirLifeTable = await getLifeTable(input.them.country, input.them.sex);

        // Calculate
        const calculation = calculateExpectedEncounters(input, yourLifeTable, theirLifeTable);

        setResult(calculation);
      } catch (err) {
        console.error('Calculation error:', err);
        setError('Error al calcular. Por favor verifica los datos ingresados.');
      } finally {
        setLoading(false);
      }
    }

    calculate();
  }, [input]);

  if (loading) {
    return (
      <div className="card text-center py-12">
        <div className="animate-pulse">
          <div className="w-16 h-16 bg-primary-200 rounded-full mx-auto mb-4"></div>
          <p className="text-neutral-600">Calculando...</p>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="card bg-red-50 border-red-200">
        <p className="text-red-700">{error || 'Error desconocido'}</p>
      </div>
    );
  }

  const relationLabels: Record<string, string> = {
    mother: 'tu madre',
    father: 'tu padre',
    grandmother_maternal: 'tu abuela materna',
    grandmother_paternal: 'tu abuela paterna',
    grandfather_maternal: 'tu abuelo materno',
    grandfather_paternal: 'tu abuelo paterno',
    partner: 'tu pareja',
    friend: 'esta persona',
    other_family: 'esta persona',
    other: 'esta persona',
  };

  const relationLabel = relationLabels[input.relationType] || 'esta persona';
  const countryName = getCountryName(input.them.country, 'es');

  const min = result.expectedVisitsRange.p25;
  const max = result.expectedVisitsRange.p75;
  const yearsMin = Math.floor(result.yearsWithBothAlive.min);
  const yearsMax = Math.ceil(result.yearsWithBothAlive.max);

  // MODO NORMAL
  if (!directMode) {
    return (
      <div className="space-y-6">
        {/* Main result - Normal mode */}
        <div className="card bg-gradient-to-br from-primary-50 to-white border-primary-200">
          <h3 className="text-2xl mb-6 text-center">
            Si todo sigue igual, podrías ver a {relationLabel} unas {min} a {max} veces más en tu
            vida.
          </h3>

          <div className="prose prose-neutral max-w-none">
            <p className="text-neutral-700 leading-relaxed">
              Según los datos de esperanza de vida para {countryName} y las edades de ambos, es
              razonable esperar que sigan con vida, al mismo tiempo, alrededor de{' '}
              <strong>
                {yearsMin} a {yearsMax} años más
              </strong>
              .
            </p>

            <p className="text-neutral-700 leading-relaxed">
              Si ves a {relationLabel} <strong>{input.visitsPerYear} veces al año</strong>, eso se
              traduce en un rango aproximado de{' '}
              <strong>
                {min} a {max} visitas presenciales futuras
              </strong>
              .
            </p>

            <p className="text-neutral-700 leading-relaxed">
              Es solo una estimación estadística, no conoce la salud real de ninguno, ni accidentes,
              ni cambios de vida. Pero sí te muestra algo cierto:{' '}
              <strong className="text-primary-700">el número no es infinito</strong>.
            </p>
          </div>
        </div>

        {/* Action suggestions */}
        <div className="card border-primary-300 bg-primary-50">
          <h4 className="text-lg font-semibold mb-4">
            Puedes decidir qué hacer con esta información.
          </h4>

          <p className="text-neutral-700 mb-3">Algunas personas eligen:</p>

          <ul className="space-y-2 text-neutral-700">
            <li className="flex gap-3">
              <span className="text-primary-600">→</span>
              <span>Aumentar la frecuencia de visitas</span>
            </li>
            <li className="flex gap-3">
              <span className="text-primary-600">→</span>
              <span>Alargar el tiempo que pasan juntas en cada encuentro</span>
            </li>
            <li className="flex gap-3">
              <span className="text-primary-600">→</span>
              <span>O simplemente dejar de postergar una conversación importante</span>
            </li>
          </ul>
        </div>

        {/* Visualization */}
        <div className="card">
          <h4 className="text-lg font-semibold mb-4">Probabilidad de supervivencia año a año</h4>
          <VisualizationChart data={result.yearByYearSurvival} />
          <p className="text-xs text-neutral-600 mt-4">
            Este gráfico muestra la probabilidad de que ambos estén vivos en cada año futuro, basado
            en las tablas de vida de {result.assumptions.dataSource}.
          </p>
        </div>

        {/* Assumptions and disclaimers */}
        <div className="card bg-neutral-50 border-neutral-300">
          <h4 className="text-sm font-semibold mb-3 text-neutral-800">Qué calculamos y qué no</h4>

          <p className="text-sm text-neutral-700 mb-3">
            <strong>Qué calculamos:</strong> Visitas presenciales esperadas entre dos personas,
            basadas en tablas de vida por edad, sexo y país.
          </p>

          <p className="text-sm font-semibold text-neutral-800 mb-2">
            Qué no hace esta herramienta:
          </p>

          <ul className="text-sm text-neutral-700 space-y-2">
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

          <div className="mt-4 pt-4 border-t border-neutral-300">
            <p className="text-xs text-neutral-700 font-medium mb-2">Fuente de datos:</p>
            <p className="text-xs text-neutral-600 mb-1">
              {result.assumptions.dataSource} ({result.assumptions.dataYear})
            </p>
            <a
              href="https://population.un.org/wpp/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary-600 hover:text-primary-700"
            >
              → Ver fuente oficial (ONU)
            </a>
          </div>

          <div className="mt-4">
            <a
              href="/methodology"
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              → Ver cómo funciona (metodología completa)
            </a>
          </div>
        </div>
      </div>
    );
  }

  // MODO DIRECTO
  return (
    <div className="space-y-6">
      {/* Main result - Direct mode */}
      <div className="card bg-gradient-to-br from-neutral-100 to-white border-neutral-400">
        <h3 className="text-2xl mb-6 font-bold text-neutral-900">
          A este ritmo, te quedan pocas visitas con {relationLabel}.
        </h3>

        <div className="bg-white rounded-lg p-8 border-2 border-neutral-300 mb-6">
          <p className="text-lg text-neutral-800 leading-relaxed">
            Si nada cambia, es probable que solo veas a {relationLabel} unas{' '}
            <strong className="text-2xl text-neutral-900">
              {min} a {max} veces más
            </strong>{' '}
            en toda tu vida.
          </p>
        </div>

        <p className="text-neutral-700 leading-relaxed">
          No es una amenaza ni un pronóstico médico. Es aritmética aplicada a datos de mortalidad
          reales.
          <br />
          <strong>Tú decides qué haces con eso hoy.</strong>
        </p>
      </div>

      {/* Visualization */}
      <div className="card">
        <h4 className="text-lg font-semibold mb-4">Probabilidad de supervivencia año a año</h4>
        <VisualizationChart data={result.yearByYearSurvival} />
        <p className="text-xs text-neutral-600 mt-4">
          Datos: {result.assumptions.dataSource} ({result.assumptions.dataYear})
        </p>
      </div>

      {/* Disclaimers - more concise in direct mode */}
      <div className="card bg-neutral-50 border-neutral-300">
        <h4 className="text-sm font-semibold mb-3 text-neutral-800">
          Qué no hace esta herramienta
        </h4>

        <ul className="text-sm text-neutral-700 space-y-2">
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
            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            → Ver cómo funciona
          </a>
        </div>
      </div>
    </div>
  );
}
