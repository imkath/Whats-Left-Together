'use client';

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import Calculator from '@/components/Calculator';
import Hero from '@/components/Hero';
import Footer from '@/components/Footer';

export default function HomePage() {
  const t = useTranslations('why');
  const locale = useLocale();
  const points = ['section1', 'section2', 'section3'] as const;

  return (
    <main className="min-h-screen">
      <section id="calculator" className="pt-10 pb-20 md:pt-16 md:pb-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Calculator intro={<Hero />} />
        </div>
      </section>

      <section className="py-20 md:py-28 border-t border-neutral-200 dark:border-neutral-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid gap-10 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)]">
          <div>
            <h2>{t('title')}</h2>
            <p className="mt-4 text-neutral-600 dark:text-neutral-400">{t('intro')}</p>
          </div>
          <div className="grid gap-10 md:grid-cols-3 md:gap-8">
            {points.map((key) => (
              <div key={key}>
                <h3 className="text-base md:text-lg">{t(`${key}.title`)}</h3>
                <p className="mt-2 text-neutral-600 dark:text-neutral-400">{t(`${key}.text`)}</p>
              </div>
            ))}
            <p className="md:col-span-3">
              <Link
                href={`/${locale}/methodology`}
                className="font-medium underline underline-offset-4 decoration-neutral-300 hover:decoration-neutral-900 dark:decoration-neutral-600 dark:hover:decoration-neutral-100"
              >
                {t('seeMethodology')}
              </Link>
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
