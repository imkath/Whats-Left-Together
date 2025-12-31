import type { Metadata } from 'next';
import { Inter, Merriweather } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { ThemeProvider } from '@/components/ThemeProvider';
import { ThemeToggle } from '@/components/ThemeToggle';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const merriweather = Merriweather({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-serif',
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://whatslefttogether.com';

export function generateStaticParams() {
  return [{ locale: 'es' }, { locale: 'en' }];
}

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  let messages;
  try {
    messages = (await import(`@/lib/i18n/${locale}.json`)).default;
  } catch {
    messages = (await import(`@/lib/i18n/en.json`)).default;
  }

  const seo = messages.seo;

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: seo.title,
      template: `%s | What's Left Together`,
    },
    description: seo.description,
    keywords: seo.keywords,
    authors: [{ name: "What's Left Together", url: SITE_URL }],
    creator: "What's Left Together",
    publisher: "What's Left Together",
    formatDetection: {
      telephone: false,
      email: false,
      address: false,
    },
    manifest: '/manifest.json',
    icons: {
      icon: [
        { url: '/favicon.ico', sizes: 'any' },
        { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
        { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      ],
      apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: 'default',
      title: "What's Left Together",
    },
    alternates: {
      canonical: `${SITE_URL}/${locale}`,
      languages: {
        'es-ES': `${SITE_URL}/es`,
        'en-US': `${SITE_URL}/en`,
      },
    },
    openGraph: {
      type: 'website',
      locale: locale === 'es' ? 'es_ES' : 'en_US',
      url: `${SITE_URL}/${locale}`,
      siteName: "What's Left Together",
      title: seo.ogTitle,
      description: seo.ogDescription,
      images: [
        {
          url: `${SITE_URL}/og-image.png`,
          width: 1200,
          height: 630,
          alt: seo.ogTitle,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: seo.twitterTitle,
      description: seo.twitterDescription,
      images: [`${SITE_URL}/og-image.png`],
      creator: '@whatslefttogether',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    },
    other: {
      'mobile-web-app-capable': 'yes',
      'msapplication-TileColor': '#171717',
      'msapplication-config': '/browserconfig.xml',
    },
  };
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  let messages;
  try {
    messages = (await import(`@/lib/i18n/${locale}.json`)).default;
  } catch {
    notFound();
  }

  const seo = messages.seo;

  // Multiple JSON-LD schemas for comprehensive SEO
  const jsonLdSchemas = [
    // WebApplication schema
    {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      '@id': `${SITE_URL}/#webapp`,
      name: "What's Left Together",
      alternateName: locale === 'es' ? 'Lo que nos queda juntos' : "What's Left Together",
      description: seo.description,
      url: `${SITE_URL}/${locale}`,
      applicationCategory: 'LifestyleApplication',
      operatingSystem: 'Any',
      browserRequirements: 'Requires JavaScript',
      softwareVersion: '2.0',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      author: {
        '@type': 'Organization',
        name: "What's Left Together",
        url: SITE_URL,
      },
      inLanguage: locale === 'es' ? 'es-ES' : 'en-US',
      isAccessibleForFree: true,
      screenshot: `${SITE_URL}/og-image.png`,
      featureList:
        locale === 'es'
          ? [
              'Calculadora de visitas restantes',
              'Datos de la ONU actualizados',
              'Simulación Monte Carlo',
              'Soporte para 81 países',
            ]
          : [
              'Remaining visits calculator',
              'Updated UN data',
              'Monte Carlo simulation',
              'Support for 81 countries',
            ],
    },
    // WebSite schema for sitelinks search
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      name: "What's Left Together",
      url: SITE_URL,
      inLanguage: [locale === 'es' ? 'es-ES' : 'en-US'],
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${SITE_URL}/${locale}?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    },
    // Organization schema
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: "What's Left Together",
      url: SITE_URL,
      logo: `${SITE_URL}/icon-512.png`,
      sameAs: ['https://github.com/imkath/Whats-Left-Together'],
    },
    // FAQ schema (great for rich snippets)
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      '@id': `${SITE_URL}/${locale}/#faq`,
      mainEntity:
        locale === 'es'
          ? [
              {
                '@type': 'Question',
                name: '¿Cómo calcula esta herramienta las visitas restantes?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Utilizamos tablas de vida oficiales de la ONU (WPP-2024) por edad, sexo y país, combinadas con simulación Monte Carlo de 10,000 iteraciones para calcular probabilidades de supervivencia conjunta y estimar encuentros futuros.',
                },
              },
              {
                '@type': 'Question',
                name: '¿Es una predicción de cuándo morirá alguien?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'No. Esta herramienta NO predice muertes individuales. Usa promedios estadísticos poblacionales para estimar probabilidades. Es un espejo estadístico para reflexión, no una predicción médica.',
                },
              },
              {
                '@type': 'Question',
                name: '¿De dónde provienen los datos?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Los datos provienen de las World Population Prospects 2024 de las Naciones Unidas, que incluyen tablas de vida por edad individual para 237 países y áreas.',
                },
              },
              {
                '@type': 'Question',
                name: '¿Es gratis usar esta calculadora?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Sí, la herramienta es completamente gratuita, de código abierto, y no requiere registro. No almacenamos datos personales.',
                },
              },
            ]
          : [
              {
                '@type': 'Question',
                name: 'How does this tool calculate remaining visits?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'We use official UN life tables (WPP-2024) by age, sex and country, combined with Monte Carlo simulation of 10,000 iterations to calculate joint survival probabilities and estimate future encounters.',
                },
              },
              {
                '@type': 'Question',
                name: 'Is this a prediction of when someone will die?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'No. This tool does NOT predict individual deaths. It uses population statistical averages to estimate probabilities. It is a statistical mirror for reflection, not a medical prediction.',
                },
              },
              {
                '@type': 'Question',
                name: 'Where does the data come from?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'The data comes from the United Nations World Population Prospects 2024, which includes life tables by single year of age for 237 countries and areas.',
                },
              },
              {
                '@type': 'Question',
                name: 'Is this calculator free to use?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Yes, the tool is completely free, open source, and requires no registration. We do not store personal data.',
                },
              },
            ],
    },
    // Dataset schema for GEO (AI citability)
    {
      '@context': 'https://schema.org',
      '@type': 'Dataset',
      '@id': `${SITE_URL}/#dataset`,
      name: 'Life Tables Calculator Dataset',
      description:
        'Processed life tables from UN World Population Prospects 2024 for calculating joint survival probabilities',
      url: `${SITE_URL}/${locale}/methodology`,
      license: 'https://opensource.org/licenses/MIT',
      isAccessibleForFree: true,
      creator: {
        '@type': 'Organization',
        name: 'United Nations, Department of Economic and Social Affairs, Population Division',
        url: 'https://population.un.org/wpp/',
      },
      distribution: {
        '@type': 'DataDownload',
        encodingFormat: 'application/json',
        contentUrl: `${SITE_URL}/data/life-tables`,
      },
      temporalCoverage: '2023',
      spatialCoverage: {
        '@type': 'Place',
        name: '81 countries worldwide',
      },
      variableMeasured: [
        {
          '@type': 'PropertyValue',
          name: 'qx',
          description: 'Probability of dying between age x and x+1',
        },
        {
          '@type': 'PropertyValue',
          name: 'lx',
          description: 'Number of survivors at age x from 100,000 births',
        },
        {
          '@type': 'PropertyValue',
          name: 'ex',
          description: 'Life expectancy at age x',
        },
      ],
      citation: {
        '@type': 'CreativeWork',
        name: 'United Nations World Population Prospects 2024',
        url: 'https://population.un.org/wpp/',
        datePublished: '2024',
      },
    },
    // HowTo schema for GEO (step-by-step guidance)
    {
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      '@id': `${SITE_URL}/${locale}/#howto`,
      name:
        locale === 'es'
          ? 'Cómo calcular visitas restantes con seres queridos'
          : 'How to calculate remaining visits with loved ones',
      description:
        locale === 'es'
          ? 'Guía paso a paso para usar la calculadora de tiempo restante'
          : 'Step-by-step guide to use the remaining time calculator',
      step:
        locale === 'es'
          ? [
              {
                '@type': 'HowToStep',
                position: 1,
                name: 'Ingresa tu información',
                text: 'Introduce tu edad, sexo biológico y país de residencia',
              },
              {
                '@type': 'HowToStep',
                position: 2,
                name: 'Ingresa información de la otra persona',
                text: 'Introduce la edad, sexo y país de la persona con quien quieres calcular',
              },
              {
                '@type': 'HowToStep',
                position: 3,
                name: 'Define la frecuencia de visitas',
                text: 'Indica cuántas veces al año se ven actualmente en persona',
              },
              {
                '@type': 'HowToStep',
                position: 4,
                name: 'Obtén tus resultados',
                text: 'Revisa el número estimado de visitas restantes con intervalo de confianza',
              },
            ]
          : [
              {
                '@type': 'HowToStep',
                position: 1,
                name: 'Enter your information',
                text: 'Input your age, biological sex, and country of residence',
              },
              {
                '@type': 'HowToStep',
                position: 2,
                name: "Enter the other person's information",
                text: 'Input the age, sex, and country of the person you want to calculate with',
              },
              {
                '@type': 'HowToStep',
                position: 3,
                name: 'Define visit frequency',
                text: 'Indicate how many times per year you currently see each other in person',
              },
              {
                '@type': 'HowToStep',
                position: 4,
                name: 'Get your results',
                text: 'Review the estimated number of remaining visits with confidence interval',
              },
            ],
      tool: {
        '@type': 'HowToTool',
        name: "What's Left Together Calculator",
      },
    },
  ];

  return (
    <html
      lang={locale}
      className={`${inter.variable} ${merriweather.variable}`}
      suppressHydrationWarning
    >
      <head>
        <meta name="theme-color" content="#171717" media="(prefers-color-scheme: dark)" />
        <meta name="theme-color" content="#fafafa" media="(prefers-color-scheme: light)" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* GEO: Link to LLMs.txt for AI crawlers */}
        <link rel="alternate" type="text/plain" href="/llms.txt" title="LLM Information" />
        {jsonLdSchemas.map((schema, index) => (
          <script
            key={index}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
          />
        ))}
      </head>
      <body className="font-sans bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 antialiased">
        <ThemeProvider>
          <NextIntlClientProvider locale={locale} messages={messages}>
            <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
              <ThemeToggle />
              <LanguageSwitcher />
            </div>
            {children}
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
