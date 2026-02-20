'use client';

import { useTranslations } from 'next-intl';

interface SourcesSectionProps {
  compact?: boolean;
  showTitle?: boolean;
}

export default function SourcesSection({ compact = false, showTitle = true }: SourcesSectionProps) {
  const t = useTranslations('sources');

  const sources = [
    {
      nameKey: 'un.name',
      organizationKey: 'un.organization',
      url: 'https://population.un.org/wpp/',
      descriptionKey: 'un.description',
      isPrimary: true,
    },
    {
      nameKey: 'who.name',
      organizationKey: 'who.organization',
      url: 'https://www.who.int/data/gho',
      descriptionKey: 'who.description',
    },
    {
      nameKey: 'hmd.name',
      organizationKey: 'hmd.organization',
      url: 'https://www.mortality.org',
      descriptionKey: 'hmd.description',
    },
    {
      nameKey: 'owid.name',
      organizationKey: 'owid.organization',
      url: 'https://ourworldindata.org/time-use',
      descriptionKey: 'owid.description',
    },
    {
      nameKey: 'sst.name',
      organizationKey: 'sst.organization',
      url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC8599276/',
      descriptionKey: 'sst.description',
    },
  ];

  const additionalCount = sources.length - 1;

  if (compact) {
    return (
      <div className="text-sm">
        {showTitle && (
          <h4 className="font-semibold text-neutral-800 dark:text-neutral-200 mb-3">
            {t('title')}:
          </h4>
        )}
        <ul className="space-y-2">
          {sources
            .filter((s) => s.isPrimary)
            .map((source) => (
              <li key={source.url} className="flex gap-2">
                <span className="text-primary-600 dark:text-primary-400">→</span>
                <div>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
                  >
                    {t(source.nameKey)}
                  </a>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                    {t(source.descriptionKey)}
                  </p>
                </div>
              </li>
            ))}
          <li className="text-xs text-neutral-600 dark:text-neutral-400 mt-3">
            <a
              href="/methodology"
              className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
            >
              + {t('additionalSources', { count: additionalCount })} →
            </a>
          </li>
        </ul>
      </div>
    );
  }

  return (
    <div>
      {showTitle && (
        <h3 className="text-2xl font-bold mb-6 text-neutral-900 dark:text-neutral-100">
          {t('title')}
        </h3>
      )}

      <div className="space-y-4">
        {sources.map((source) => (
          <div
            key={source.url}
            className={`card ${source.isPrimary ? 'border-primary-300 dark:border-primary-700 bg-primary-50 dark:bg-primary-900/20' : ''}`}
          >
            <div className="flex items-start gap-3">
              {source.isPrimary && <span className="text-2xl">⭐</span>}
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                  {t(source.nameKey)}
                </h4>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                  {t(source.organizationKey)}
                </p>
                <p className="text-neutral-700 dark:text-neutral-300 mt-2">
                  {t(source.descriptionKey)}
                </p>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-3 text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium text-sm"
                >
                  → {t('viewSource')}
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
        <p className="text-sm text-neutral-700 dark:text-neutral-300">
          <strong>{t('transparency.title')}:</strong> {t('transparency.description')}
        </p>
        <a
          href="/methodology"
          className="inline-block mt-2 text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium text-sm"
        >
          → {t('viewMethodology')}
        </a>
      </div>
    </div>
  );
}
