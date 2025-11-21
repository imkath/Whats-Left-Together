'use client';

import { useTranslations, useLocale } from 'next-intl';

export default function Footer() {
  const t = useTranslations('footer');
  const locale = useLocale();

  return (
    <footer className="bg-neutral-900 dark:bg-neutral-950 text-neutral-300 py-12">
      <div className="container-custom">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-white text-lg mb-4">{t('title')}</h3>
            <p className="text-sm">{t('tagline')}</p>
          </div>

          <div>
            <h4 className="text-white text-sm font-semibold mb-3">{t('links')}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href={`/${locale}/methodology`} className="hover:text-white transition-colors">
                  {t('methodology')}
                </a>
              </li>
              <li>
                <a href="https://github.com/[repo]" className="hover:text-white transition-colors">
                  {t('github')}
                </a>
              </li>
              <li>
                <a href={`/${locale}/about`} className="hover:text-white transition-colors">
                  {t('about')}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white text-sm font-semibold mb-3">{t('dataSources')}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://population.un.org/wpp/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  {t('unData')}
                </a>
              </li>
              <li>
                <a
                  href={`/${locale}/methodology#fuentes`}
                  className="hover:text-white transition-colors"
                >
                  + {t('moreSources')}
                </a>
              </li>
            </ul>
            <p className="text-xs text-neutral-400 mt-3">{t('notMedical')}</p>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-neutral-800 text-center text-sm text-neutral-400">
          <p>{t('copyright')}</p>
        </div>
      </div>
    </footer>
  );
}
