'use client';

import { ArrowLeft, Database, AlertTriangle, BookOpen, Code, FileText } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Footer from '@/components/Footer';

export default function MethodologyPage() {
  const t = useTranslations('methodologyPage');

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
            {t('backToCalculator')}
          </a>
          <h1 className="text-4xl font-bold mt-2">{t('title')}</h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-2">{t('subtitle')}</p>
        </div>
      </header>

      <div className="container-custom py-12 max-w-4xl">
        {/* Abstract */}
        <div className="card mb-8">
          <p
            className="text-lg text-neutral-700 dark:text-neutral-300 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: t.raw('abstract') }}
          />
        </div>

        {/* 1. What we calculate */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-4">{t('section1.title')}</h2>
          <div className="card">
            <p
              className="text-neutral-700 dark:text-neutral-300 mb-3"
              dangerouslySetInnerHTML={{ __html: t.raw('section1.mainText') }}
            />
            <p className="text-neutral-700 dark:text-neutral-300">{t('section1.description')}</p>
          </div>
        </section>

        {/* 2. Data sources */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-4">{t('section2.title')}</h2>

          <div className="space-y-4">
            {/* Main source */}
            <div className="card border-primary-300 dark:border-primary-700 bg-primary-50 dark:bg-neutral-800">
              <div className="mb-3 flex items-start gap-3">
                <div className="mt-1 text-primary-700 dark:text-primary-400">
                  <Database size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-primary-900 dark:text-primary-300">
                    {t('section2.mainSource.title')}
                  </h3>
                  <p className="text-sm text-primary-700 dark:text-primary-400 mt-1 font-medium">
                    {t('section2.mainSource.subtitle')}
                  </p>
                </div>
              </div>

              <div className="text-neutral-700 dark:text-neutral-300 space-y-2 text-sm">
                <p>
                  <strong>{t('section2.mainSource.provides')}</strong>
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>{t('section2.mainSource.item1')}</li>
                  <li dangerouslySetInnerHTML={{ __html: t.raw('section2.mainSource.item2') }} />
                  <li>{t('section2.mainSource.item3')}</li>
                  <li>{t('section2.mainSource.item4')}</li>
                </ul>

                <p className="mt-3">
                  <strong>{t('section2.mainSource.organization')}</strong>{' '}
                  {t('section2.mainSource.organizationValue')}
                </p>
                <p>
                  <strong>{t('section2.mainSource.update')}</strong>{' '}
                  {t('section2.mainSource.updateValue')}
                </p>

                <a
                  href="https://population.un.org/wpp/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-3 text-primary-700 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
                >
                  {t('section2.mainSource.viewSource')}
                </a>
              </div>
            </div>

            {/* Validation sources */}
            <div className="card">
              <h4 className="font-semibold mb-3">{t('section2.validationSources.title')}</h4>

              <div className="space-y-3 text-sm">
                <div className="border-l-2 border-primary-500 dark:border-primary-400 pl-3">
                  <div className="text-neutral-700 dark:text-neutral-300">
                    <strong>{t('section2.validationSources.who.name')}</strong> -{' '}
                    {t('section2.validationSources.who.description')}
                    <br />
                    <a
                      href="https://www.who.int/data/gho"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                    >
                      www.who.int/data/gho
                    </a>
                  </div>
                </div>

                <div className="border-l-2 border-primary-500 dark:border-primary-400 pl-3">
                  <div className="text-neutral-700 dark:text-neutral-300">
                    <strong>{t('section2.validationSources.hmd.name')}</strong> -{' '}
                    {t('section2.validationSources.hmd.description')}
                    <br />
                    <a
                      href="https://www.mortality.org"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                    >
                      www.mortality.org
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Assumptions */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-4">{t('section3.title')}</h2>

          <div className="card">
            <ul className="space-y-3 text-neutral-700 dark:text-neutral-300">
              <li className="flex gap-3">
                <span className="text-primary-600 dark:text-primary-400 font-bold">→</span>
                <div>
                  <strong>{t('section3.assumption1.title')}</strong>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                    {t('section3.assumption1.description')}
                  </p>
                </div>
              </li>

              <li className="flex gap-3">
                <span className="text-primary-600 dark:text-primary-400 font-bold">→</span>
                <div>
                  <strong>{t('section3.assumption2.title')}</strong>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                    {t('section3.assumption2.description')}
                  </p>
                </div>
              </li>

              <li className="flex gap-3">
                <span className="text-primary-600 dark:text-primary-400 font-bold">→</span>
                <div>
                  <strong>{t('section3.assumption3.title')}</strong>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                    {t('section3.assumption3.description')}
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </section>

        {/* 4. What this tool does NOT do */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-4 flex items-center gap-3">
            <AlertTriangle size={28} className="text-red-600 dark:text-red-500" />{' '}
            {t('section4.title')}
          </h2>

          <div className="card bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-800 border-l-4">
            <ul className="space-y-2 text-neutral-800 dark:text-neutral-200 list-disc list-inside">
              <li>
                <strong>{t('section4.item1')}</strong>
              </li>
              <li>
                <strong>{t('section4.item2')}</strong>
              </li>
              <li>
                <strong>{t('section4.item3')}</strong>
              </li>
              <li>
                <strong>{t('section4.item4')}</strong>
              </li>
            </ul>
          </div>
        </section>

        {/* 5. Why showing this number is useful */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-4 flex items-center gap-3">
            <BookOpen size={28} className="text-primary-700 dark:text-primary-400" />{' '}
            {t('section5.title')}
          </h2>

          <div className="card border-primary-300 dark:border-primary-700">
            <h3 className="text-xl font-semibold mb-4">{t('section5.foundationTitle')}</h3>

            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <p
                className="text-neutral-700 dark:text-neutral-300"
                dangerouslySetInnerHTML={{ __html: t.raw('section5.paragraph1') }}
              />

              <p
                className="text-neutral-700 dark:text-neutral-300 mt-3"
                dangerouslySetInnerHTML={{ __html: t.raw('section5.paragraph2') }}
              />

              <div className="bg-neutral-100 dark:bg-neutral-700 border-l-4 border-primary-500 dark:border-primary-400 p-4 mt-4 rounded">
                <p className="text-sm font-medium mb-2">{t('section5.referenceTitle')}</p>
                <p
                  className="text-sm text-neutral-700 dark:text-neutral-300"
                  dangerouslySetInnerHTML={{ __html: t.raw('section5.referenceText') }}
                />
                <a
                  href="https://pmc.ncbi.nlm.nih.gov/articles/PMC8599276/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 text-sm font-medium mt-2 inline-block"
                >
                  {t('section5.readArticle')}
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Time use context */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-4">{t('timeUse.title')}</h2>

          <div className="card">
            <p
              className="text-neutral-700 dark:text-neutral-300 mb-4"
              dangerouslySetInnerHTML={{ __html: t.raw('timeUse.intro') }}
            />

            <ul className="space-y-2 text-neutral-700 dark:text-neutral-300 ml-6 list-disc">
              <li>{t('timeUse.item1')}</li>
              <li>{t('timeUse.item2')}</li>
              <li>{t('timeUse.item3')}</li>
            </ul>

            <p
              className="text-neutral-700 dark:text-neutral-300 mt-4"
              dangerouslySetInnerHTML={{ __html: t.raw('timeUse.conclusion') }}
            />

            <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-400 dark:border-amber-600 rounded">
              <p
                className="text-sm text-neutral-700 dark:text-neutral-300"
                dangerouslySetInnerHTML={{ __html: t.raw('timeUse.whyNotImplemented') }}
              />
            </div>

            <a
              href="https://ourworldindata.org/time-use"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-3 text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
            >
              {t('timeUse.viewData')}
            </a>
          </div>
        </section>

        {/* Mathematical model */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-4">{t('mathModel.title')}</h2>

          <div className="card">
            {/* Notation section */}
            <div className="mb-6 p-4 bg-neutral-100 dark:bg-neutral-700 rounded-lg">
              <h3
                className="text-sm font-semibold mb-3 text-neutral-800 dark:text-neutral-200"
                dangerouslySetInnerHTML={{ __html: t.raw('mathModel.notation.title') }}
              />
              <ul className="space-y-2 text-sm text-neutral-700 dark:text-neutral-300">
                {(t.raw('mathModel.notation.items') as string[]).map((item: string, i: number) => (
                  <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
                ))}
              </ul>
            </div>

            <h3 className="text-lg font-semibold mb-4">{t('mathModel.stepByStep')}</h3>

            <div className="space-y-6 text-neutral-700 dark:text-neutral-300">
              {/* Step 1 */}
              <div className="border-l-4 border-primary-500 dark:border-primary-400 pl-4">
                <strong
                  className="text-base"
                  dangerouslySetInnerHTML={{ __html: t.raw('mathModel.step1.title') }}
                />
                <p
                  className="mt-2 text-sm"
                  dangerouslySetInnerHTML={{ __html: t.raw('mathModel.step1.description') }}
                />
                <div className="mt-3 p-3 bg-neutral-50 dark:bg-neutral-700 rounded font-mono text-center text-lg">
                  <span dangerouslySetInnerHTML={{ __html: t.raw('mathModel.step1.formula') }} />
                </div>
                <p
                  className="text-xs text-neutral-600 dark:text-neutral-400 mt-2 italic"
                  dangerouslySetInnerHTML={{ __html: t.raw('mathModel.step1.note') }}
                />
              </div>

              {/* Step 2 */}
              <div className="border-l-4 border-primary-500 dark:border-primary-400 pl-4">
                <strong className="text-base">{t('mathModel.step2.title')}</strong>
                <p
                  className="mt-2 text-sm"
                  dangerouslySetInnerHTML={{ __html: t.raw('mathModel.step2.description') }}
                />
                <div className="mt-3 p-3 bg-neutral-50 dark:bg-neutral-700 rounded font-mono text-center text-lg">
                  <span dangerouslySetInnerHTML={{ __html: t.raw('mathModel.step2.formula') }} />
                </div>
                <p
                  className="text-xs text-neutral-600 dark:text-neutral-400 mt-2 italic"
                  dangerouslySetInnerHTML={{ __html: t.raw('mathModel.step2.note') }}
                />
              </div>

              {/* Step 3 */}
              <div className="border-l-4 border-primary-500 dark:border-primary-400 pl-4">
                <strong className="text-base">{t('mathModel.step3.title')}</strong>
                <p
                  className="mt-2 text-sm"
                  dangerouslySetInnerHTML={{ __html: t.raw('mathModel.step3.description') }}
                />
                <div className="mt-3 p-3 bg-neutral-50 dark:bg-neutral-700 rounded font-mono text-center text-lg">
                  <span dangerouslySetInnerHTML={{ __html: t.raw('mathModel.step3.formula') }} />
                </div>
                <p
                  className="text-xs text-neutral-600 dark:text-neutral-400 mt-2 italic"
                  dangerouslySetInnerHTML={{ __html: t.raw('mathModel.step3.note') }}
                />
              </div>

              {/* Step 4 */}
              <div className="border-l-4 border-primary-500 dark:border-primary-400 pl-4">
                <strong className="text-base">{t('mathModel.step4.title')}</strong>
                <p
                  className="mt-2 text-sm"
                  dangerouslySetInnerHTML={{ __html: t.raw('mathModel.step4.description') }}
                />
                <div className="mt-3 p-3 bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-800 rounded font-mono text-center text-lg">
                  <span dangerouslySetInnerHTML={{ __html: t.raw('mathModel.step4.formula') }} />
                </div>
                <p
                  className="text-xs text-neutral-600 dark:text-neutral-400 mt-2 italic"
                  dangerouslySetInnerHTML={{ __html: t.raw('mathModel.step4.note') }}
                />
              </div>

              {/* Step 5 */}
              <div className="border-l-4 border-neutral-400 dark:border-neutral-600 pl-4">
                <strong className="text-base">{t('mathModel.step5.title')}</strong>
                <p
                  className="mt-2 text-sm"
                  dangerouslySetInnerHTML={{ __html: t.raw('mathModel.step5.description') }}
                />
                <div className="mt-3 p-3 bg-neutral-50 dark:bg-neutral-700 rounded font-mono text-center text-lg">
                  <span dangerouslySetInnerHTML={{ __html: t.raw('mathModel.step5.formula') }} />
                </div>
                <p
                  className="text-xs text-neutral-600 dark:text-neutral-400 mt-2 italic"
                  dangerouslySetInnerHTML={{ __html: t.raw('mathModel.step5.note') }}
                />
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-700">
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                <strong>{t('mathModel.reference')}</strong>{' '}
                <span dangerouslySetInnerHTML={{ __html: t.raw('mathModel.referenceText') }} />
              </p>
            </div>
          </div>
        </section>

        {/* Transparency */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-4 flex items-center gap-3">
            <Code size={28} className="text-primary-700 dark:text-primary-400" />{' '}
            {t('transparency.title')}
          </h2>

          <div className="card bg-primary-50 dark:bg-neutral-800 border-primary-200 dark:border-primary-800">
            <p
              className="text-neutral-700 dark:text-neutral-300 mb-4"
              dangerouslySetInnerHTML={{ __html: t.raw('transparency.intro') }}
            />

            <ul className="space-y-2 text-sm list-disc list-inside text-neutral-700 dark:text-neutral-300">
              <li>{t('transparency.item1')}</li>
              <li>{t('transparency.item2')}</li>
              <li>{t('transparency.item3')}</li>
              <li>{t('transparency.item4')}</li>
            </ul>

            <div className="mt-4">
              <a
                href="https://github.com/kcastillo-co/whats-left-together"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary inline-block"
              >
                {t('transparency.viewCode')}
              </a>
            </div>
          </div>
        </section>

        {/* Complete references */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-4 flex items-center gap-3">
            <FileText size={28} className="text-primary-700 dark:text-primary-400" />{' '}
            {t('references.title')}
          </h2>

          <div className="card">
            <h3 className="font-semibold mb-3">{t('references.demographicData')}</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-neutral-700 dark:text-neutral-300 mb-6">
              <li>
                <span dangerouslySetInnerHTML={{ __html: t.raw('references.ref1') }} />{' '}
                <a
                  href="https://population.un.org/wpp/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                >
                  https://population.un.org/wpp/
                </a>
              </li>
              <li>
                <span dangerouslySetInnerHTML={{ __html: t.raw('references.ref2') }} />{' '}
                <a
                  href="https://www.who.int/data/gho"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                >
                  https://www.who.int/data/gho
                </a>
              </li>
              <li>
                {t('references.ref3')}{' '}
                <a
                  href="https://www.mortality.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                >
                  www.mortality.org
                </a>
              </li>
            </ol>

            <h3 className="font-semibold mb-3">{t('references.timeUse')}</h3>
            <ol
              className="list-decimal list-inside space-y-2 text-sm text-neutral-700 dark:text-neutral-300 mb-6"
              start={4}
            >
              <li>
                <span dangerouslySetInnerHTML={{ __html: t.raw('references.ref4') }} />{' '}
                <a
                  href="https://ourworldindata.org/time-use"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                >
                  https://ourworldindata.org/time-use
                </a>
              </li>
              <li>
                <span dangerouslySetInnerHTML={{ __html: t.raw('references.ref5') }} />{' '}
                <a
                  href="https://www.bls.gov/tus/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                >
                  https://www.bls.gov/tus/
                </a>
              </li>
            </ol>

            <h3 className="font-semibold mb-3">{t('references.theoreticalFramework')}</h3>
            <ol
              className="list-decimal list-inside space-y-2 text-sm text-neutral-700 dark:text-neutral-300"
              start={6}
            >
              <li>
                <span dangerouslySetInnerHTML={{ __html: t.raw('references.ref6') }} />{' '}
                <a
                  href="https://pmc.ncbi.nlm.nih.gov/articles/PMC8599276/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                >
                  https://doi.org/10.1093/geront/gnab116
                </a>
              </li>
              <li dangerouslySetInnerHTML={{ __html: t.raw('references.ref7') }} />
            </ol>
          </div>
        </section>

        {/* Final CTA */}
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
