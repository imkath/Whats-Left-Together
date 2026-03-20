'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { MessageSquare } from 'lucide-react';
import FeedbackModal from './FeedbackModal';

export default function Footer() {
  const t = useTranslations('footer');
  const locale = useLocale();
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  return (
    <>
      <footer className="border-t-2 border-accent-500 bg-neutral-900 dark:bg-neutral-950 text-neutral-300 py-12">
        <div className="container-custom">
          <div className="grid md:grid-cols-[2fr_1fr_1fr] gap-8">
            <div>
              <h3 className="text-white text-xl mb-1">{t('title')}</h3>
              <div className="w-8 h-0.5 bg-accent-500 mt-3 mb-2" />
              <p className="text-sm">{t('tagline')}</p>
            </div>

            <div>
              <h4 className="text-white text-sm font-semibold mb-3">{t('links')}</h4>
              <nav aria-label="Footer navigation">
                <ul className="space-y-2 text-sm">
                  <li>
                    <a
                      href={`/${locale}/methodology`}
                      className="hover:text-accent-400 transition-colors"
                    >
                      {t('methodology')}
                    </a>
                  </li>
                  <li>
                    <a
                      href={`/${locale}/about`}
                      className="hover:text-accent-400 transition-colors"
                    >
                      {t('about')}
                    </a>
                  </li>
                  <li>
                    <button
                      onClick={() => setIsFeedbackOpen(true)}
                      className="hover:text-accent-400 transition-colors inline-flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm outline-none"
                    >
                      <MessageSquare size={14} />
                      {t('feedback')}
                    </button>
                  </li>
                </ul>
              </nav>
            </div>

            <div>
              <h4 className="text-white text-sm font-semibold mb-3">{t('dataSources')}</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="https://population.un.org/wpp/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-accent-400 transition-colors"
                  >
                    {t('unData')}
                  </a>
                </li>
                <li>
                  <a
                    href={`/${locale}/methodology#fuentes`}
                    className="hover:text-accent-400 transition-colors"
                  >
                    + {t('moreSources')}
                  </a>
                </li>
              </ul>
              <p className="text-xs text-neutral-400 mt-3">{t('notMedical')}</p>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-neutral-800 text-center text-xs text-neutral-500">
            <p>
              &copy; {new Date().getFullYear()} {t('copyright')}
            </p>
          </div>
        </div>
      </footer>

      <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
    </>
  );
}
