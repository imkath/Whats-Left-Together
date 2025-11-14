'use client'

import type { SurvivalProbability } from '@/types'

interface VisualizationChartProps {
  data: SurvivalProbability[]
}

export default function VisualizationChart({ data }: VisualizationChartProps) {
  // Validate data
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-64 bg-neutral-50 rounded-lg p-4 flex items-center justify-center text-neutral-500">
        No hay datos suficientes para mostrar el gráfico
      </div>
    )
  }

  // Take every Nth point to avoid overcrowding (show ~20-30 points max)
  const step = Math.max(1, Math.floor(data.length / 25))
  const displayData = data.filter((_, i) => i % step === 0)

  // Ensure we have at least 2 points for the chart
  if (displayData.length < 2) {
    return (
      <div className="w-full h-64 bg-neutral-50 rounded-lg p-4 flex items-center justify-center text-neutral-500">
        No hay datos suficientes para mostrar el gráfico
      </div>
    )
  }

  const maxValue = 1.0

  return (
    <div className="w-full">
      {/* Simple SVG chart - no external dependencies needed */}
      <div className="relative h-64 bg-neutral-50 rounded-lg p-4">
        <svg
          viewBox="0 0 800 200"
          className="w-full h-full"
          preserveAspectRatio="none"
        >
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1.0].map((value) => {
            const y = 200 - (value * 200)
            return (
              <g key={value}>
                <line
                  x1="0"
                  y1={y}
                  x2="800"
                  y2={y}
                  stroke="#e5e7eb"
                  strokeWidth="1"
                />
                <text
                  x="-5"
                  y={y}
                  fontSize="10"
                  fill="#6b7280"
                  textAnchor="end"
                  dominantBaseline="middle"
                >
                  {Math.round(value * 100)}%
                </text>
              </g>
            )
          })}

          {/* Lines */}
          {/* Both alive (main line) */}
          <polyline
            points={displayData
              .map((d, i) => {
                const x = (i / (displayData.length - 1)) * 800
                const y = 200 - ((d.bothAlive || 0) * 200)
                return `${x},${y}`
              })
              .join(' ')}
            fill="none"
            stroke="#171717"
            strokeWidth="3"
          />

          {/* You alive (faint) */}
          <polyline
            points={displayData
              .map((d, i) => {
                const x = (i / (displayData.length - 1)) * 800
                const y = 200 - ((d.youAlive || 0) * 200)
                return `${x},${y}`
              })
              .join(' ')}
            fill="none"
            stroke="#a3a3a3"
            strokeWidth="1"
            strokeDasharray="4,4"
          />

          {/* Them alive (faint) */}
          <polyline
            points={displayData
              .map((d, i) => {
                const x = (i / (displayData.length - 1)) * 800
                const y = 200 - ((d.themAlive || 0) * 200)
                return `${x},${y}`
              })
              .join(' ')}
            fill="none"
            stroke="#8b7355"
            strokeWidth="1"
            strokeDasharray="4,4"
          />
        </svg>

        {/* X-axis label */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-neutral-600 px-4">
          <span>Ahora</span>
          <span>Años futuros</span>
          <span>+{data.length} años</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-6 mt-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-1 bg-neutral-900 rounded"></div>
          <span>Ambos vivos</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-1 bg-neutral-400 rounded border-dashed border border-neutral-500"></div>
          <span>Tú vivo/a</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-1 bg-accent-500 rounded border-dashed border border-accent-600"></div>
          <span>Ellos vivos</span>
        </div>
      </div>
    </div>
  )
}
