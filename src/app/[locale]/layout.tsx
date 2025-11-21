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
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    authors: [{ name: "What's Left Together", url: SITE_URL }],
    creator: "What's Left Together",
    publisher: "What's Left Together",
    formatDetection: {
      telephone: false,
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

  // JSON-LD structured data for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: seo.title,
    description: seo.description,
    url: `${SITE_URL}/${locale}`,
    applicationCategory: 'LifestyleApplication',
    operatingSystem: 'Any',
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
    publisher: {
      '@type': 'Organization',
      name: "What's Left Together",
      url: SITE_URL,
    },
  };

  return (
    <html
      lang={locale}
      className={`${inter.variable} ${merriweather.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
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
