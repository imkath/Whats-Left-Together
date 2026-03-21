'use client';

import { useState } from 'react';
import { ArrowLeft, UsersGroupRounded, Heart, Mailbox, ChatLine } from '@solar-icons/react';
import Footer from '@/components/Footer';
import FeedbackModal from '@/components/FeedbackModal';
import Breadcrumb from '@/components/Breadcrumb';
import ScrollReveal from '@/components/ScrollReveal';
import { useTranslations, useLocale } from 'next-intl';

export default function AboutPage() {
  const t = useTranslations('about');
  const tNav = useTranslations('nav');
  const locale = useLocale();
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      {/* Header */}
      <header className="bg-[#fafaf8] dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700">
        <div className="container-custom py-6">
          <Breadcrumb
            items={[{ label: tNav('about'), href: `/${locale}/about` }]}
            locale={locale}
            siteUrl="https://whatslefttogether.com"
          />
          <a
            href={`/${locale}`}
            className="text-accent-600 hover:text-accent-700 dark:text-accent-400 dark:hover:text-accent-300 text-sm mb-2 inline-flex items-center gap-2 font-medium transition-colors"
          >
            <ArrowLeft size={16} />
            {t('backToHome')}
          </a>
          <h1 className="text-4xl font-extrabold mt-2">{t('title')}</h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-2">{t('subtitle')}</p>
          <div className="w-12 h-1 bg-accent-500 mt-4 rounded-full" />
        </div>
      </header>

      <div className="container-custom py-12 max-w-4xl">
        {/* Propósito */}
        <ScrollReveal>
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-4">
              <Heart
                size={28}
                className="text-neutral-700 dark:text-neutral-300 inline-block align-middle mr-3"
                aria-hidden="true"
              />
              {t('sections.purpose.title')}
            </h2>

            <div className="card">
              <div className="prose prose-neutral dark:prose-invert max-w-none">
                <p className="text-neutral-700 dark:text-neutral-300 text-lg leading-relaxed mb-4">
                  {t('sections.purpose.p1')}
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
        </ScrollReveal>

        {/* Inspiración */}
        <ScrollReveal delay={100}>
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-4">
              <UsersGroupRounded
                size={28}
                className="text-neutral-700 dark:text-neutral-300 inline-block align-middle mr-3"
                aria-hidden="true"
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
        </ScrollReveal>

        {/* Para quién es */}
        <ScrollReveal delay={200}>
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
        </ScrollReveal>

        {/* Qué hacer con esta información */}
        <ScrollReveal delay={300}>
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
        </ScrollReveal>

        {/* Contacto y Feedback */}
        <ScrollReveal delay={400}>
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-4">
              <Mailbox
                size={28}
                className="text-neutral-700 dark:text-neutral-300 inline-block align-middle mr-3"
                aria-hidden="true"
              />
              {t('sections.contact.title')}
            </h2>

            <div className="card bg-neutral-100 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-600">
              <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed mb-4">
                {t('sections.contact.intro')}
              </p>

              <button
                onClick={() => setIsFeedbackOpen(true)}
                className="btn-primary inline-flex items-center gap-2"
              >
                <ChatLine size={18} aria-hidden="true" />
                {t('sections.contact.sendFeedback')}
              </button>

              <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-4">
                {t('sections.contact.note')}
              </p>
            </div>
          </section>
        </ScrollReveal>

        {/* Límites éticos */}
        <ScrollReveal delay={500}>
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
        </ScrollReveal>

        {/* CTA final */}
        <ScrollReveal>
          <div className="text-center py-8">
            <a href="/" className="btn-primary inline-flex items-center gap-2">
              <ArrowLeft size={18} />
              {t('backToCalculator')}
            </a>
          </div>
        </ScrollReveal>
      </div>

      <Footer />
      <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
    </div>
  );
}
