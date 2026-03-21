'use client';

import { useState, useEffect } from 'react';
import { ClockCircle, Heart, Target, Book2 } from '@solar-icons/react';
import { useTranslations, useLocale } from 'next-intl';
import Calculator from '@/components/Calculator';
import Hero from '@/components/Hero';
import EthicalWarning from '@/components/EthicalWarning';
import Footer from '@/components/Footer';
import ScrollReveal from '@/components/ScrollReveal';

export default function HomePage() {
  const [hasAcceptedWarning, setHasAcceptedWarning] = useState<boolean | null>(null);
  const t = useTranslations('why');
  const locale = useLocale();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const accepted = localStorage.getItem('ethicalWarningAccepted');
      setHasAcceptedWarning(accepted === 'true');
    } catch {
      setHasAcceptedWarning(true);
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
      {/* Ethical warning modal */}
      {hasAcceptedWarning === false && <EthicalWarning onAccept={handleAcceptWarning} />}

      {/* Hero section - full bleed dark */}
      <Hero />

      {/* Calculator section */}
      <section id="calculator" className="py-16 md:py-20 bg-[#fafaf8] dark:bg-neutral-900">
        <div className="container-custom">
          <Calculator />
        </div>
      </section>

      {/* Why it matters section - editorial style */}
      <section className="py-16 md:py-24 bg-white dark:bg-neutral-800/50">
        <div className="container-custom">
          <ScrollReveal>
            <div className="text-center mb-16">
              <div className="w-12 h-1 bg-accent-500 mx-auto mb-4 rounded-full" />
              <h2 className="text-3xl md:text-4xl font-extrabold mb-4">{t('title')}</h2>
              <p className="text-lg text-neutral-500 dark:text-neutral-400 max-w-xl mx-auto">
                {t('intro')}
              </p>
            </div>
          </ScrollReveal>

          <div className="space-y-6 max-w-4xl mx-auto">
            {/* Featured card */}
            <ScrollReveal>
              <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-neutral-100 to-neutral-50 dark:from-neutral-900 dark:to-neutral-950 p-8 md:p-10 transition-shadow duration-300 hover:shadow-xl border border-neutral-200 dark:border-neutral-800">
                <div className="absolute top-0 right-0 w-64 h-64 bg-accent-500/5 dark:bg-accent-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="relative">
                  <div className="mb-5 text-accent-500 dark:text-accent-400 group-hover:scale-110 transition-transform duration-300 inline-block">
                    <ClockCircle size={36} weight="BoldDuotone" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-neutral-900 dark:text-white">
                    {t('section1.title')}
                  </h3>
                  <p className="text-lg text-neutral-600 dark:text-neutral-300 leading-relaxed max-w-2xl">
                    {t('section1.text')}
                  </p>
                </div>
              </div>
            </ScrollReveal>

            {/* Secondary cards */}
            <div className="grid md:grid-cols-2 gap-6">
              <ScrollReveal delay={150}>
                <div className="group card hover:shadow-lg transition-shadow duration-300 h-full">
                  <div className="mb-4 text-accent-500 group-hover:scale-110 transition-transform duration-300 inline-block">
                    <Heart size={28} weight="BoldDuotone" />
                  </div>
                  <h3 className="text-lg font-bold mb-3">{t('section2.title')}</h3>
                  <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    {t('section2.text')}
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={300}>
                <div className="group card hover:shadow-lg transition-shadow duration-300 h-full">
                  <div className="mb-4 text-accent-500 group-hover:scale-110 transition-transform duration-300 inline-block">
                    <Target size={28} weight="BoldDuotone" />
                  </div>
                  <h3 className="text-lg font-bold mb-3">{t('section3.title')}</h3>
                  <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    {t('section3.text')}
                  </p>
                </div>
              </ScrollReveal>
            </div>
          </div>

          <ScrollReveal delay={400}>
            <div className="mt-12 text-center">
              <a
                href={`/${locale}/methodology`}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full border-2 border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 hover:border-accent-500 hover:text-accent-600 dark:hover:border-accent-500 dark:hover:text-accent-400 transition-colors duration-300 font-medium"
              >
                <Book2 size={18} weight="BoldDuotone" />
                {t('seeMethodology')}
              </a>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <Footer />
    </main>
  );
}
