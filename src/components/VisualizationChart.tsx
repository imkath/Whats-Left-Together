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
  /** Force dark theme colors (for use inside dark containers) */
  forceDark?: boolean;
}

export default function VisualizationChart({ data, forceDark = false }: VisualizationChartProps) {
  const t = useTranslations('results.chart');
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    return () => observer.disconnect();
  }, []);

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-64 rounded-lg p-4 flex items-center justify-center text-neutral-500">
        {t('noData')}
      </div>
    );
  }

  const step = Math.max(1, Math.floor(data.length / 25));
  const displayData = data
    .filter((_, i) => i % step === 0)
    .map((d) => ({
      ...d,
      bothAlivePercent: Math.round((d.bothAlive || 0) * 100),
      youAlivePercent: Math.round((d.youAlive || 0) * 100),
      themAlivePercent: Math.round((d.themAlive || 0) * 100),
    }));

  if (displayData.length < 2) {
    return (
      <div className="w-full h-64 rounded-lg p-4 flex items-center justify-center text-neutral-500">
        {t('noData')}
      </div>
    );
  }

  const dark = forceDark || isDarkMode;

  const colors = {
    bothAlive: '#c8922e', // accent-500 - main highlight
    youAlive: '#3b82f6', // blue-500
    themAlive: '#10b981', // emerald-500
    grid: dark ? 'rgba(255,255,255,0.08)' : '#e5e7eb',
    tick: dark ? '#737373' : '#6b7280',
    tooltipBg: dark ? '#1a1a1a' : 'white',
    tooltipBorder: dark ? '#333' : '#e5e7eb',
    tooltipText: dark ? '#d4d4d4' : '#525252',
    legendText: dark ? '#a3a3a3' : '#6b7280',
  };

  return (
    <div className="w-full">
      <div
        className={`h-72 rounded-xl p-4 ${forceDark ? '' : 'bg-neutral-50 dark:bg-neutral-800'}`}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={displayData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} vertical={false} />
            <XAxis
              dataKey="year"
              tick={{ fontSize: 11, fill: colors.tick }}
              tickFormatter={(value) => (value === 0 ? t('now') : `+${value}`)}
              axisLine={{ stroke: colors.grid }}
              tickLine={false}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 11, fill: colors.tick }}
              tickFormatter={(value) => `${value}%`}
              axisLine={false}
              tickLine={false}
              width={40}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: colors.tooltipBg,
                border: `1px solid ${colors.tooltipBorder}`,
                borderRadius: '12px',
                fontSize: '12px',
                color: colors.tooltipText,
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
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
              wrapperStyle={{ color: colors.legendText, fontSize: '12px' }}
              iconType="circle"
              iconSize={8}
            />
            <Line
              type="monotone"
              dataKey="bothAlivePercent"
              stroke={colors.bothAlive}
              strokeWidth={3}
              dot={false}
              activeDot={{
                r: 5,
                strokeWidth: 2,
                stroke: colors.bothAlive,
                fill: dark ? '#0a0a0a' : '#fff',
              }}
            />
            <Line
              type="monotone"
              dataKey="youAlivePercent"
              stroke={colors.youAlive}
              strokeWidth={2}
              strokeDasharray="6 3"
              dot={false}
              activeDot={{
                r: 4,
                strokeWidth: 2,
                stroke: colors.youAlive,
                fill: dark ? '#0a0a0a' : '#fff',
              }}
            />
            <Line
              type="monotone"
              dataKey="themAlivePercent"
              stroke={colors.themAlive}
              strokeWidth={2}
              strokeDasharray="6 3"
              dot={false}
              activeDot={{
                r: 4,
                strokeWidth: 2,
                stroke: colors.themAlive,
                fill: dark ? '#0a0a0a' : '#fff',
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
