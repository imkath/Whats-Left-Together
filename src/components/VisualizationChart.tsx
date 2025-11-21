'use client';

import { useTranslations } from 'next-intl';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { SurvivalProbability } from '@/types';

interface VisualizationChartProps {
  data: SurvivalProbability[];
}

export default function VisualizationChart({ data }: VisualizationChartProps) {
  const t = useTranslations('results.chart');

  // Validate data
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-64 bg-neutral-50 rounded-lg p-4 flex items-center justify-center text-neutral-500">
        {t('noData')}
      </div>
    );
  }

  // Take every Nth point to avoid overcrowding (show ~20-30 points max)
  const step = Math.max(1, Math.floor(data.length / 25));
  const displayData = data
    .filter((_, i) => i % step === 0)
    .map((d) => ({
      ...d,
      // Convert to percentages for display
      bothAlivePercent: Math.round((d.bothAlive || 0) * 100),
      youAlivePercent: Math.round((d.youAlive || 0) * 100),
      themAlivePercent: Math.round((d.themAlive || 0) * 100),
    }));

  // Ensure we have at least 2 points for the chart
  if (displayData.length < 2) {
    return (
      <div className="w-full h-64 bg-neutral-50 rounded-lg p-4 flex items-center justify-center text-neutral-500">
        {t('noData')}
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="h-64 bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={displayData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="year"
              tick={{ fontSize: 12, fill: '#6b7280' }}
              tickFormatter={(value) => (value === 0 ? t('now') : `+${value}`)}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 12, fill: '#6b7280' }}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              formatter={(value: number, name: string) => {
                const labels: Record<string, string> = {
                  bothAlivePercent: t('bothAlive'),
                  youAlivePercent: t('youAlive'),
                  themAlivePercent: t('themAlive'),
                };
                return [`${value}%`, labels[name] || name];
              }}
              labelFormatter={(label) => `${t('futureYears')}: +${label}`}
            />
            <Legend
              formatter={(value: string) => {
                const labels: Record<string, string> = {
                  bothAlivePercent: t('bothAlive'),
                  youAlivePercent: t('youAlive'),
                  themAlivePercent: t('themAlive'),
                };
                return labels[value] || value;
              }}
            />
            <Line
              type="monotone"
              dataKey="bothAlivePercent"
              stroke="#171717"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="youAlivePercent"
              stroke="#3b82f6"
              strokeWidth={2}
              strokeDasharray="6 3"
              dot={false}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="themAlivePercent"
              stroke="#f97316"
              strokeWidth={2}
              strokeDasharray="6 3"
              dot={false}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
