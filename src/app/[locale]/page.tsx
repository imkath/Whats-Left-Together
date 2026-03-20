'use client';

import { useState, useEffect } from 'react';
import { Clock, Heart, Target, BookOpen } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import Calculator from '@/components/Calculator';
import Hero from '@/components/Hero';
import EthicalWarning from '@/components/EthicalWarning';
import Footer from '@/components/Footer';

export default function HomePage() {
  // null = loading, true = accepted, false = not accepted
  const [hasAcceptedWarning, setHasAcceptedWarning] = useState<boolean | null>(null);
  const t = useTranslations('why');
  const locale = useLocale();

  useEffect(() => {
    // SSR safety check - only access localStorage on client
    if (typeof window === 'undefined') return;

    try {
      const accepted = localStorage.getItem('ethicalWarningAccepted');
      setHasAcceptedWarning(accepted === 'true');
    } catch {
      // localStorage might be disabled (private browsing, etc.)
      setHasAcceptedWarning(true); // Skip warning if storage unavailable
    }
  }, []);

  const handleAcceptWarning = () => {
    try {
      localStorage.setItem('ethicalWarningAccepted', 'true');
    } catch {
      // Silently fail if localStorage is unavailable
    }
    setHasAcceptedWarning(true);
  };

  return (
    <main className="min-h-screen">
      {/* Ethical warning modal - only show after hydration check */}
      {hasAcceptedWarning === false && <EthicalWarning onAccept={handleAcceptWarning} />}

      {/* Hero section */}
      <Hero />

      {/* Calculator section */}
      <section id="calculator" className="py-16 bg-white dark:bg-neutral-800">
        <div className="container-custom">
          <Calculator />
        </div>
      </section>

      {/* Why it matters section */}
      <section className="py-16 bg-neutral-100 dark:bg-neutral-900">
        <div className="container-custom">
          <h2 className="text-center mb-8">{t('title')}</h2>

          <div className="mt-12 space-y-6">
            {/* Featured card — full width, warm accent border */}
            <div className="card hover:shadow-md transition-all duration-300 hover:translate-y-[-2px] border-l-4 border-accent-500 pl-6">
              <div className="mb-4 text-neutral-700 dark:text-neutral-300">
                <Clock size={40} />
              </div>
              <h3 className="text-2xl mb-4">{t('section1.title')}</h3>
              <p className="text-lg text-neutral-700 dark:text-neutral-300">{t('section1.text')}</p>
            </div>

            {/* Secondary cards — 2-column row */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="card hover:shadow-md transition-all duration-300 hover:translate-y-[-2px]">
                <div className="mb-4 text-neutral-700 dark:text-neutral-300">
                  <Heart size={28} />
                </div>
                <h3 className="text-lg mb-3">{t('section2.title')}</h3>
                <p className="text-sm text-neutral-700 dark:text-neutral-300">
                  {t('section2.text')}
                </p>
              </div>

              <div className="card hover:shadow-md transition-all duration-300 hover:translate-y-[-2px]">
                <div className="mb-4 text-neutral-700 dark:text-neutral-300">
                  <Target size={28} />
                </div>
                <h3 className="text-lg mb-3">{t('section3.title')}</h3>
                <p className="text-sm text-neutral-700 dark:text-neutral-300">
                  {t('section3.text')}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <a
              href={`/${locale}/methodology`}
              className="btn-secondary inline-flex items-center gap-2"
            >
              <BookOpen size={18} />
              {t('seeMethodology')}
            </a>
            <div className="mx-auto mt-4 w-16 border-t-2 border-accent-300" />
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
