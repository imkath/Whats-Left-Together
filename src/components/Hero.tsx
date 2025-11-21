'use client';

import { Calculator } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function Hero() {
  const t = useTranslations('hero');

  return (
    <section className="bg-gradient-to-b from-neutral-50 via-white to-neutral-50 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900 py-20">
      <div className="container-custom text-center">
        <h1 className="mb-6">{t('title')}</h1>

        <p className="text-xl text-neutral-700 dark:text-neutral-300 max-w-3xl mx-auto mb-6">
          {t('subtitle')}
        </p>

        <div className="mt-8">
          <a href="#calculator" className="btn-primary inline-flex items-center gap-2">
            <Calculator size={20} />
            {t('cta')}
          </a>
        </div>

        <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto mt-8 leading-relaxed">
          {t('belowButton')}
        </p>
      </div>
    </section>
  );
}
