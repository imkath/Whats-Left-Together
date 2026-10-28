'use client';

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';

/**
 * Intro column that sits beside the calculator. The wordmark is the title, so
 * nothing competes with it: one sentence, one honest note, one link.
 */
export default function Hero() {
  const t = useTranslations('hero');
  const locale = useLocale();

  return (
    <div className="lg:pt-10">
      <h1 className="sr-only">{t('title')}</h1>
      <picture>
        <source srcSet="/logo-wslt.webp" type="image/webp" />
        <img
          src="/logo-wslt.png"
          alt="What's Left Together"
          width={2445}
          height={293}
          className="w-full max-w-[34rem] h-auto dark:invert"
          fetchPriority="high"
        />
      </picture>

      <p className="mt-8 text-xl md:text-2xl leading-snug text-neutral-900 dark:text-neutral-100 max-w-[30rem]">
        {t('subtitle')}
      </p>

      <p className="mt-5 text-sm text-neutral-500 dark:text-neutral-400 max-w-[28rem]">
        {t('note')}{' '}
        <Link
          href={`/${locale}/methodology`}
          className="text-neutral-900 dark:text-neutral-100 underline underline-offset-4 decoration-neutral-300 hover:decoration-neutral-900 dark:decoration-neutral-600 dark:hover:decoration-neutral-100"
        >
          {t('howLink')}
        </Link>
      </p>
    </div>
  );
}
