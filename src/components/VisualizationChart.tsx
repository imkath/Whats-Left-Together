'use client';

import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { ResponsiveLine } from '@nivo/line';
import type { SliceTooltipProps, CommonCustomLayerProps, LineSvgLayer } from '@nivo/line';
import type { SurvivalProbability } from '@/types';

type ChartSeries = {
  id: string;
  data: readonly { x: number; y: number }[];
};

interface VisualizationChartProps {
  data: SurvivalProbability[];
  /** Force dark theme colors (for use inside dark containers) */
  forceDark?: boolean;
}

export default function VisualizationChart({ data, forceDark = false }: VisualizationChartProps) {
  const t = useTranslations('results.chart');
  const { resolvedTheme } = useTheme();

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-64 rounded-lg p-4 flex items-center justify-center text-neutral-500">
        {t('noData')}
      </div>
    );
  }

  const step = Math.max(1, Math.floor(data.length / 25));
  const sampled = data.filter((_, i) => i % step === 0);

  if (sampled.length < 2) {
    return (
      <div className="w-full h-64 rounded-lg p-4 flex items-center justify-center text-neutral-500">
        {t('noData')}
      </div>
    );
  }

  const dark = forceDark || resolvedTheme === 'dark';

  const seriesLabels: Record<string, string> = {
    bothAlive: t('bothAlive'),
    youAlive: t('youAlive'),
    themAlive: t('themAlive'),
  };

  const seriesColors = ['#c8922e', '#3b82f6', '#10b981'];

  // Nivo expects series format: [{ id, data: [{ x, y }] }]
  const nivoData = [
    {
      id: 'bothAlive',
      data: sampled.map((d) => ({ x: d.year, y: Math.round(d.bothAlive * 100) })),
    },
    {
      id: 'youAlive',
      data: sampled.map((d) => ({ x: d.year, y: Math.round(d.youAlive * 100) })),
    },
    {
      id: 'themAlive',
      data: sampled.map((d) => ({ x: d.year, y: Math.round(d.themAlive * 100) })),
    },
  ];

  // Show ~6 ticks on X axis to avoid crowding
  const tickStep = Math.max(1, Math.floor(sampled.length / 6));
  const xTickValues = sampled
    .filter((_, i) => i === 0 || i % tickStep === 0 || i === sampled.length - 1)
    .map((d) => d.year);

  const nivoTheme = {
    background: 'transparent' as const,
    axis: {
      domain: { line: { stroke: 'transparent' } },
      ticks: {
        line: { stroke: 'transparent' },
        text: { fontSize: 11, fill: dark ? '#737373' : '#6b7280' },
      },
    },
    grid: {
      line: {
        stroke: dark ? 'rgba(255,255,255,0.08)' : '#e5e7eb',
        strokeDasharray: '3 3',
      },
    },
    crosshair: {
      line: { stroke: dark ? '#525252' : '#d1d5db', strokeWidth: 1 },
    },
    legends: {
      text: { fontSize: 12, fill: dark ? '#a3a3a3' : '#6b7280' },
    },
  };

  // Custom lines layer: solid for bothAlive, dashed for individual
  const DashedLines = ({ series, lineGenerator }: CommonCustomLayerProps<ChartSeries>) => (
    <>
      {series.map(({ id, data: points, color }) => (
        <path
          key={id}
          d={lineGenerator(points.map((d) => d.position)) || ''}
          fill="none"
          stroke={color}
          strokeWidth={id === 'bothAlive' ? 3 : 2}
          strokeDasharray={id === 'bothAlive' ? undefined : '6 3'}
        />
      ))}
    </>
  );

  return (
    <div className="w-full">
      <div
        className={`h-72 rounded-lg p-4 ${forceDark ? '' : 'bg-neutral-50 dark:bg-neutral-800'}`}
      >
        <ResponsiveLine
          data={nivoData}
          theme={nivoTheme}
          colors={seriesColors}
          margin={{ top: 10, right: 16, bottom: 50, left: 45 }}
          xScale={{ type: 'point' }}
          yScale={{ type: 'linear', min: 0, max: 100 }}
          curve="monotoneX"
          axisBottom={{
            tickSize: 0,
            tickPadding: 8,
            tickValues: xTickValues,
            format: (value) => (Number(value) === 0 ? t('now') : `+${value}`),
          }}
          axisLeft={{
            tickSize: 0,
            tickPadding: 8,
            tickValues: [0, 25, 50, 75, 100],
            format: (value) => `${value}%`,
          }}
          enableGridX={false}
          enableGridY={true}
          enablePoints={false}
          enableSlices="x"
          sliceTooltip={({ slice }: SliceTooltipProps<ChartSeries>) => (
            <div
              style={{
                background: dark ? '#1a1a1a' : 'white',
                border: `1px solid ${dark ? '#333' : '#e5e7eb'}`,
                borderRadius: '12px',
                padding: '10px 14px',
                fontSize: '12px',
                color: dark ? '#d4d4d4' : '#525252',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              }}
            >
              <div style={{ marginBottom: '6px', fontWeight: 500 }}>
                {t('futureYears')}: +{slice.points[0].data.x}
              </div>
              {slice.points.map((point) => (
                <div
                  key={point.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '2px 0',
                  }}
                >
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: point.seriesColor,
                      flexShrink: 0,
                    }}
                  />
                  <span>{seriesLabels[point.seriesId as string] || point.seriesId}</span>
                  <span style={{ fontWeight: 600, marginLeft: 'auto' }}>{point.data.y}%</span>
                </div>
              ))}
            </div>
          )}
          layers={[
            'grid',
            'axes',
            'crosshair',
            DashedLines as unknown as LineSvgLayer<ChartSeries>,
            'slices',
            'mesh',
            'legends',
          ]}
          legends={[
            {
              anchor: 'bottom',
              direction: 'row',
              translateY: 46,
              itemWidth: 110,
              itemHeight: 20,
              symbolSize: 8,
              symbolShape: 'circle',
              data: [
                { id: 'bothAlive', label: seriesLabels.bothAlive, color: seriesColors[0] },
                { id: 'youAlive', label: seriesLabels.youAlive, color: seriesColors[1] },
                { id: 'themAlive', label: seriesLabels.themAlive, color: seriesColors[2] },
              ],
            },
          ]}
          animate={true}
          motionConfig="gentle"
        />
      </div>
    </div>
  );
}
