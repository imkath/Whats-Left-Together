import type { Metadata } from 'next';
import { Inter, Merriweather } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';
import LanguageSwitcher from '@/components/LanguageSwitcher';
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

export const metadata: Metadata = {
  title: "What's Left Together | Lo que nos queda juntos",
  description:
    'A statistical mirror for decisions that matter. Un espejo estadístico para decisiones que importan.',
  keywords: 'life expectancy, relationships, time, mortality, statistics, actuarial',
  authors: [{ name: "What's Left Together" }],
  openGraph: {
    type: 'website',
    title: "What's Left Together | Lo que nos queda juntos",
    description:
      'A statistical mirror for decisions that matter. Un espejo estadístico para decisiones que importan.',
  },
};

export function generateStaticParams() {
  return [{ locale: 'es' }, { locale: 'en' }];
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

  return (
    <html lang={locale} className={`${inter.variable} ${merriweather.variable}`}>
      <body className="font-sans bg-neutral-50 text-neutral-900 antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <div className="fixed top-4 right-4 z-50">
            <LanguageSwitcher />
          </div>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
