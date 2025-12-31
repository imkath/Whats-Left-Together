'use client';

import { useState, useEffect } from 'react';
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
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Detect dark mode and listen for changes
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };

    // Initial check
    checkDarkMode();

    // Watch for class changes on html element
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

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

  // Colors that work well in both light and dark mode
  const colors = {
    bothAlive: '#10b981', // emerald-500 - visible in both modes
    youAlive: '#3b82f6', // blue-500
    themAlive: '#f97316', // orange-500
    grid: isDarkMode ? '#525252' : '#e5e7eb', // neutral-600 : neutral-200
    tick: isDarkMode ? '#a3a3a3' : '#6b7280', // neutral-400 : neutral-500
    tooltipBg: isDarkMode ? '#262626' : 'white', // neutral-800 : white
    tooltipBorder: isDarkMode ? '#525252' : '#e5e7eb',
  };

  return (
    <div className="w-full">
      <div className="h-64 bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={displayData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
            <XAxis
              dataKey="year"
              tick={{ fontSize: 12, fill: colors.tick }}
              tickFormatter={(value) => (value === 0 ? t('now') : `+${value}`)}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 12, fill: colors.tick }}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: colors.tooltipBg,
                border: `1px solid ${colors.tooltipBorder}`,
                borderRadius: '8px',
                fontSize: '12px',
                color: colors.tick,
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
              wrapperStyle={{ color: colors.tick }}
            />
            <Line
              type="monotone"
              dataKey="bothAlivePercent"
              stroke={colors.bothAlive}
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="youAlivePercent"
              stroke={colors.youAlive}
              strokeWidth={2}
              strokeDasharray="6 3"
              dot={false}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="themAlivePercent"
              stroke={colors.themAlive}
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
