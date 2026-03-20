'use client';

import { Calculator } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function Hero() {
  const t = useTranslations('hero');

  return (
    <section className="bg-gradient-to-b from-[#fafaf8] via-white to-[#fafaf8] dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900 py-16">
      <div className="container-custom text-center animate-fade-in">
        <h1 className="mb-6 sr-only">{t('title')}</h1>
        <picture>
          <source srcSet="/logo-wslt.webp" type="image/webp" />
          <img
            src="/logo-wslt.png"
            alt="What's Left Together"
            width={800}
            height={80}
            className="w-full max-w-3xl mx-auto h-auto mb-6 dark:invert hover:opacity-90 transition-opacity duration-300"
            fetchPriority="high"
          />
        </picture>

        <p className="text-lg text-neutral-700 dark:text-neutral-300 max-w-3xl mx-auto mb-6">
          {t('subtitle')}
        </p>

        <div className="w-16 h-px bg-neutral-300 dark:bg-neutral-600 mx-auto my-6" />

        <div className="mt-8">
          <a href="#calculator" className="btn-primary inline-flex items-center gap-2 group">
            <Calculator
              size={20}
              aria-hidden="true"
              className="group-hover:translate-y-[1px] transition-transform duration-200"
            />
            {t('cta')}
          </a>
        </div>

        <p className="text-xs tracking-wide uppercase text-neutral-600 dark:text-neutral-400 max-w-lg mx-auto mt-8 leading-relaxed">
          {t('belowButton')}
        </p>
      </div>
    </section>
  );
}
