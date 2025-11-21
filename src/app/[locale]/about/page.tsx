'use client';

import { ArrowLeft, Users, Heart, Code, Mail } from 'lucide-react';
import Footer from '@/components/Footer';
import { useTranslations } from 'next-intl';

export default function AboutPage() {
  const t = useTranslations('about');

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      {/* Header */}
      <header className="bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700">
        <div className="container-custom py-6">
          <a
            href="/"
            className="text-primary-700 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300 text-sm mb-2 inline-flex items-center gap-2 font-medium transition-colors"
          >
            <ArrowLeft size={16} />
            {t('backToHome')}
          </a>
          <h1 className="text-4xl font-bold mt-2">{t('title')}</h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-2">{t('subtitle')}</p>
        </div>
      </header>

      <div className="container-custom py-12 max-w-4xl">
        {/* Propósito */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-4">
            <Heart
              size={28}
              className="text-neutral-700 dark:text-neutral-300 inline-block align-middle mr-3"
            />
            {t('sections.purpose.title')}
          </h2>

          <div className="card">
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <p className="text-neutral-700 dark:text-neutral-300 text-lg leading-relaxed mb-4">
                <strong>What's Left Together</strong> {t('sections.purpose.p1')}
              </p>

              <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed mb-4">
                {t('sections.purpose.p2')}
              </p>

              <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
                {t('sections.purpose.p3')}
              </p>
            </div>
          </div>
        </section>

        {/* Inspiración */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-4">
            <Users
              size={28}
              className="text-neutral-700 dark:text-neutral-300 inline-block align-middle mr-3"
            />
            {t('sections.inspiration.title')}
          </h2>

          <div className="card bg-neutral-100 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-600">
            <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed mb-4">
              {t('sections.inspiration.p1')}{' '}
              <a
                href="https://waitbutwhy.com/2015/12/the-tail-end.html"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-700 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300 underline font-medium"
              >
                {t('sections.inspiration.linkText')}
              </a>
            </p>

            <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
              {t('sections.inspiration.p2')}
            </p>
          </div>
        </section>

        {/* Para quién es */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-4">{t('sections.audience.title')}</h2>

          <div className="space-y-4">
            <div className="card hover:shadow-md transition-shadow">
              <h3 className="text-xl font-semibold mb-2">{t('sections.audience.card1.title')}</h3>
              <p className="text-neutral-700 dark:text-neutral-300">
                {t('sections.audience.card1.text')}
              </p>
            </div>

            <div className="card hover:shadow-md transition-shadow">
              <h3 className="text-xl font-semibold mb-2">{t('sections.audience.card2.title')}</h3>
              <p className="text-neutral-700 dark:text-neutral-300">
                {t('sections.audience.card2.text')}
              </p>
            </div>

            <div className="card hover:shadow-md transition-shadow">
              <h3 className="text-xl font-semibold mb-2">{t('sections.audience.card3.title')}</h3>
              <p className="text-neutral-700 dark:text-neutral-300">
                {t('sections.audience.card3.text')}
              </p>
            </div>

            <div className="card hover:shadow-md transition-shadow">
              <h3 className="text-xl font-semibold mb-2">{t('sections.audience.card4.title')}</h3>
              <p className="text-neutral-700 dark:text-neutral-300">
                {t('sections.audience.card4.text')}
              </p>
            </div>
          </div>
        </section>

        {/* Qué hacer con esta información */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-4">{t('sections.whatToDo.title')}</h2>

          <div className="card border-primary-300 dark:border-primary-700 bg-primary-50 dark:bg-neutral-800">
            <p className="text-neutral-800 dark:text-neutral-200 mb-4 font-medium">
              {t('sections.whatToDo.intro')}
            </p>

            <ul className="space-y-3 text-neutral-700 dark:text-neutral-300">
              <li className="flex gap-3">
                <span className="text-primary-700 dark:text-primary-400 font-bold">•</span>
                <span>
                  <strong>{t('sections.whatToDo.action1.title')}</strong>{' '}
                  {t('sections.whatToDo.action1.text')}
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary-700 dark:text-primary-400 font-bold">•</span>
                <span>
                  <strong>{t('sections.whatToDo.action2.title')}</strong>{' '}
                  {t('sections.whatToDo.action2.text')}
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary-700 dark:text-primary-400 font-bold">•</span>
                <span>
                  <strong>{t('sections.whatToDo.action3.title')}</strong>{' '}
                  {t('sections.whatToDo.action3.text')}
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary-700 dark:text-primary-400 font-bold">•</span>
                <span>
                  <strong>{t('sections.whatToDo.action4.title')}</strong>{' '}
                  {t('sections.whatToDo.action4.text')}
                </span>
              </li>
            </ul>
          </div>
        </section>

        {/* Código abierto */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-4">
            <Code
              size={28}
              className="text-neutral-700 dark:text-neutral-300 inline-block align-middle mr-3"
            />
            {t('sections.openSource.title')}
          </h2>

          <div className="card">
            <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed mb-4">
              {t('sections.openSource.intro')}
            </p>

            <ul className="list-disc list-inside space-y-2 text-neutral-700 dark:text-neutral-300 mb-4">
              <li>{t('sections.openSource.item1')}</li>
              <li>{t('sections.openSource.item2')}</li>
              <li>{t('sections.openSource.item3')}</li>
              <li>{t('sections.openSource.item4')}</li>
            </ul>

            <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed mb-4">
              {t('sections.openSource.contribute')}
            </p>

            <div className="mt-4">
              <a
                href="https://github.com/[tu-repo]/whats-left-together"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary inline-flex items-center gap-2"
              >
                <Code size={18} />
                {t('sections.openSource.viewCode')}
              </a>
            </div>
          </div>
        </section>

        {/* Contacto */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-4">
            <Mail
              size={28}
              className="text-neutral-700 dark:text-neutral-300 inline-block align-middle mr-3"
            />
            {t('sections.contact.title')}
          </h2>

          <div className="card bg-neutral-100 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-600">
            <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed mb-4">
              {t('sections.contact.intro')}
            </p>

            <ul className="space-y-2 text-sm text-neutral-700 dark:text-neutral-300">
              <li>
                <strong>{t('sections.contact.github')}</strong>{' '}
                <a
                  href="https://github.com/[tu-repo]/whats-left-together/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-700 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300 underline"
                >
                  {t('sections.contact.githubLink')}
                </a>
              </li>
              <li>
                <strong>{t('sections.contact.email')}</strong> [tu-email]
              </li>
            </ul>

            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-4">
              {t('sections.contact.note')}
            </p>
          </div>
        </section>

        {/* Límites éticos */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-4">{t('sections.ethics.title')}</h2>

          <div className="card border-red-300 dark:border-red-800 border-l-4 bg-red-50 dark:bg-red-900/20">
            <h3 className="text-lg font-semibold mb-3 text-red-900 dark:text-red-300">
              {t('sections.ethics.warningTitle')}
            </h3>

            <ul className="space-y-2 text-neutral-800 dark:text-neutral-200 list-disc list-inside">
              <li>{t('sections.ethics.warning1')}</li>
              <li>{t('sections.ethics.warning2')}</li>
              <li>{t('sections.ethics.warning3')}</li>
              <li>{t('sections.ethics.warning4')}</li>
              <li>{t('sections.ethics.warning5')}</li>
            </ul>

            <p className="mt-4 text-sm text-neutral-700 dark:text-neutral-300">
              {t('sections.ethics.note')}
            </p>
          </div>
        </section>

        {/* CTA final */}
        <div className="text-center py-8">
          <a href="/" className="btn-primary inline-flex items-center gap-2">
            <ArrowLeft size={18} />
            {t('backToCalculator')}
          </a>
        </div>
      </div>

      <Footer />
    </div>
  );
}
