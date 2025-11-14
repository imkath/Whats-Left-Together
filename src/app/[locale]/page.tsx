'use client';

import { useState, useEffect } from 'react';
import { Clock, Heart, Target, BookOpen } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import Calculator from '@/components/Calculator';
import Hero from '@/components/Hero';
import EthicalWarning from '@/components/EthicalWarning';
import Footer from '@/components/Footer';

export default function HomePage() {
  const [hasAcceptedWarning, setHasAcceptedWarning] = useState(true); // Start as true to avoid flash
  const t = useTranslations('why');
  const locale = useLocale();

  useEffect(() => {
    // Check if user has already accepted the warning
    const accepted = localStorage.getItem('ethicalWarningAccepted');
    if (!accepted) {
      setHasAcceptedWarning(false);
    }
  }, []);

  const handleAcceptWarning = () => {
    localStorage.setItem('ethicalWarningAccepted', 'true');
    setHasAcceptedWarning(true);
  };

  return (
    <main className="min-h-screen">
      {/* Ethical warning modal */}
      {!hasAcceptedWarning && <EthicalWarning onAccept={handleAcceptWarning} />}

      {/* Hero section */}
      <Hero />

      {/* Calculator section */}
      <section id="calculator" className="py-16 bg-white">
        <div className="container-custom">
          <Calculator />
        </div>
      </section>

      {/* Why it matters section */}
      <section className="py-16 bg-neutral-100">
        <div className="container-custom">
          <h2 className="text-center mb-8">{t('title')}</h2>

          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <div className="card hover:shadow-md transition-shadow">
              <div className="mb-4 text-neutral-700">
                <Clock size={32} />
              </div>
              <h3 className="text-xl mb-4">{t('section1.title')}</h3>
              <p className="text-neutral-700">{t('section1.text')}</p>
            </div>

            <div className="card hover:shadow-md transition-shadow">
              <div className="mb-4 text-neutral-700">
                <Heart size={32} />
              </div>
              <h3 className="text-xl mb-4">{t('section2.title')}</h3>
              <p className="text-neutral-700">{t('section2.text')}</p>
            </div>

            <div className="card hover:shadow-md transition-shadow">
              <div className="mb-4 text-neutral-700">
                <Target size={32} />
              </div>
              <h3 className="text-xl mb-4">{t('section3.title')}</h3>
              <p className="text-neutral-700">{t('section3.text')}</p>
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
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
